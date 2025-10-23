// Trang đăng ký
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { isAdmin } from '@/utils/adminCheck';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { validateForm } from '@/utils/validateEmail';
import { VALIDATION_RULES } from '@/utils/constants';
import ecoLogo from '@/assets/logo/eco_green.png';
import AuthService from '@/services/AuthService';
import type { RegisterData } from '@/types';
import { showToast } from '@/utils/toast';

const Register = () => {
  const navigate = useNavigate();
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

  const validationRules = {
    username: [
      { type: 'required' as const, message: 'Tên đăng nhập là bắt buộc' },
      { type: 'minLength' as const, value: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
    ],
    fullName: [
      { type: 'required' as const, message: 'Họ tên là bắt buộc' },
      { type: 'minLength' as const, value: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
    ],
    email: [VALIDATION_RULES.EMAIL.REQUIRED],
    password: [VALIDATION_RULES.PASSWORD.REQUIRED],
    confirmPassword: [
      { type: 'required' as const, message: 'Xác nhận mật khẩu là bắt buộc' }
    ],
    phoneNumber: [
      { type: 'required' as const, message: 'Số điện thoại là bắt buộc' }
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
      const result = await AuthService.register(formData);
      console.log('Register successful:', result);
      showToast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error: any) {
      console.error('Register error:', error);
      setErrors({ general: error.message });
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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleGoogleSignUp = () => {
    console.log('Google sign up clicked');
  };

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
                placeholder="Email"
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
                placeholder="Số điện thoại"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`h-10 text-sm ${
                  errors.phoneNumber ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
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
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`h-10 text-sm ${
                  errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                required
              />
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
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
              className="w-full h-12 border-gray-300 text-gray-700 font-medium text-base hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
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
