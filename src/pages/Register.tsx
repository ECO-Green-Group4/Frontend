// Trang đăng ký
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { validateForm } from '@/utils/validateEmail';
import { VALIDATION_RULES } from '@/utils/constants';
import ecoLogo from '@/assets/logo/eco_green.png';
import AuthService from '@/services/AuthService';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/utils/adminCheck';
import { isStaff } from '@/utils/staffCheck';
import type { RegisterData } from '@/types';
import { showToast } from '@/utils/toast';

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

const Register = () => {
  const navigate = useNavigate();
  const { googleRegister } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    sex: '',
    identityCard: '',
    email: '',
    address: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google OAuth Client ID
  const GOOGLE_CLIENT_ID = '614758931877-ea5s7e905dsooe6qbdg0j9p8lcsfc4qk.apps.googleusercontent.com';

  const validationRules = {
    username: [
      { type: 'required' as const, message: 'Tên đăng nhập là bắt buộc' },
      { type: 'minLength' as const, value: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
    ],
    fullName: [
      { type: 'required' as const, message: 'Họ tên là bắt buộc' },
      { type: 'minLength' as const, value: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
    ],
    email: [VALIDATION_RULES.EMAIL.REQUIRED, VALIDATION_RULES.EMAIL.FORMAT],
    password: [VALIDATION_RULES.PASSWORD.REQUIRED],
    confirmPassword: [
      { type: 'required' as const, message: 'Xác nhận mật khẩu là bắt buộc' }
    ],
    phoneNumber: [
      VALIDATION_RULES.PHONE.REQUIRED,
      VALIDATION_RULES.PHONE.FORMAT
    ],
    identityCard: [
      { type: 'required' as const, message: 'CMND/CCCD là bắt buộc' }
    ],
    address: [
      { type: 'required' as const, message: 'Địa chỉ là bắt buộc' }
    ],
    dateOfBirth: [
      { type: 'required' as const, message: 'Ngày sinh là bắt buộc' }
    ],
    sex: [
      { type: 'required' as const, message: 'Giới tính là bắt buộc' }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate form
    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    // Kiểm tra password match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setLoading(true);
    try {
      console.log('Sending register data:', formData);
      console.log('Register data JSON:', JSON.stringify(formData, null, 2));
      
      const result = await AuthService.register(formData);
      console.log('Register successful:', result);
      showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
      navigate('/login');
    } catch (error: any) {
      console.error('Register error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Extract error message
      let errorMessage = 'Đăng ký thất bại';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Parse backend validation errors if available
      // Error message format: "Dữ liệu không hợp lệ\n\nfield: error1, error2; field2: error3"
      const errorLines = errorMessage.split('\n\n');
      if (errorLines.length > 1) {
        // We have detailed validation errors
        const validationErrors: Record<string, string> = {};
        errorLines[1].split(';').forEach((fieldError: string) => {
          const [field, ...messages] = fieldError.split(':');
          if (field && messages.length > 0) {
            validationErrors[field.trim()] = messages.join(':').trim();
          }
        });
        
        // Only update errors for fields that exist in our form
        const formErrors: Record<string, string> = {};
        Object.entries(validationErrors).forEach(([field, message]) => {
          if (formData.hasOwnProperty(field)) {
            formErrors[field] = message;
          }
        });
        
        if (Object.keys(formErrors).length > 0) {
          setErrors(formErrors);
          showToast('Vui lòng kiểm tra lại thông tin đăng ký', 'error');
        } else {
          showToast(errorMessage, 'error');
          setErrors({ general: errorMessage });
        }
      } else {
        // No detailed errors, just show the general message
        showToast(errorMessage, 'error');
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa error khi user bắt đầu nhập
    if (errors[name] || errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors.general; // Xóa cả general error
        return newErrors;
      });
    }
  };

  // Xử lý response từ Google
  const handleGoogleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setErrors({ general: 'Không thể lấy thông tin từ Google' });
      return;
    }

    setLoading(true);
    try {
      const authResponse = await googleRegister(response.credential);
      
      // Debug: Log user info để kiểm tra role
      console.log('Google register response user:', authResponse.user);
      console.log('Role check - isAdmin:', isAdmin(authResponse.user), 'isStaff:', isStaff(authResponse.user));
      
      showToast('Đăng ký với Google thành công!', 'success');
      
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
        // User thường - redirect về trang chủ
        console.log('Redirecting to home');
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      console.error('Google register error:', error);
      const errorMessage = error.message || 'Đăng ký với Google thất bại. Vui lòng thử lại.';
      setErrors({ general: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [googleRegister, navigate]);

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
            text: 'signup_with',
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

      {/* Register Card */}
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-green-500 mb-8">
            Sign up
          </h1>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                className={`h-10 text-sm ${
                  errors.username ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              />
              {errors.username && (
                <p className="text-red-500 text-xs">{errors.username}</p>
              )}
            </div>

            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-700 font-medium">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                className={`h-10 text-sm ${
                  errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">{errors.fullName}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className={`h-10 text-sm ${
                  errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                Số điện thoại
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="0912345678"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`h-10 text-sm ${
                  errors.phoneNumber ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                maxLength={10}
                required
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Identity Card Field */}
            <div className="space-y-2">
              <Label htmlFor="identityCard" className="text-gray-700 font-medium">
                CMND/CCCD
              </Label>
              <Input
                id="identityCard"
                name="identityCard"
                type="text"
                placeholder="CMND/CCCD"
                value={formData.identityCard}
                onChange={handleChange}
                className={`h-10 text-sm ${
                  errors.identityCard ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              />
              {errors.identityCard && (
                <p className="text-red-500 text-xs">{errors.identityCard}</p>
              )}
            </div>

            {/* Date of Birth Field */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium">
                Ngày sinh
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`h-10 text-sm ${
                  errors.dateOfBirth ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Sex Field */}
            <div className="space-y-2">
              <Label htmlFor="sex" className="text-gray-700 font-medium">
                Giới tính
              </Label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className={`w-full h-10 px-3 border rounded-md text-sm ${
                  errors.sex ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                }`}
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
              {errors.sex && (
                <p className="text-red-500 text-xs">{errors.sex}</p>
              )}
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 font-medium">
                Địa chỉ
              </Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={handleChange}
                className={`h-10 text-sm ${
                  errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              />
              {errors.address && (
                <p className="text-red-500 text-xs">{errors.address}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-10 text-sm pr-10 ${
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
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`h-10 text-sm pr-10 ${
                    errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium text-base"
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Sign Up'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <Separator />
              <div className="absolute inset-0 flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <div ref={googleButtonRef} className="w-full flex justify-center"></div>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <span className="text-gray-600">Have an account already? </span>
            <Link 
              to="/login" 
              className="text-green-500 hover:text-green-600 font-medium"
            >
              Log In
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

export default Register;
