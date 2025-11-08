// Trang đặt lại mật khẩu
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { validateForm } from '@/utils/validateEmail';
import { VALIDATION_RULES } from '@/utils/constants';
import AuthService from '@/services/AuthService';
import ecoLogo from '@/assets/logo/eco_green.png';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Lấy email từ state (được truyền từ ForgotPassword page)
  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setFormData(prev => ({
        ...prev,
        email: emailFromState
      }));
    } else {
      // Nếu không có email từ state, có thể user truy cập trực tiếp
      // Hiển thị thông báo hoặc redirect về forgot password
      // Tạm thời để user tự nhập email
    }
  }, [location.state]);

  const validationRules = {
    email: [VALIDATION_RULES.EMAIL.REQUIRED, VALIDATION_RULES.EMAIL.FORMAT],
    otp: [
      { type: 'required' as const, message: 'Mã OTP là bắt buộc' },
      { type: 'minLength' as const, value: 4, message: 'Mã OTP phải có ít nhất 4 ký tự' }
    ],
    newPassword: [
      VALIDATION_RULES.PASSWORD.REQUIRED,
      VALIDATION_RULES.PASSWORD.FORMAT
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, validationRules);
    const newErrors: Record<string, string> = { ...validation.errors };

    // Kiểm tra xác nhận mật khẩu
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);

    if (!validation.isValid || newErrors.confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.resetPassword(
        formData.email,
        formData.otp,
        formData.newPassword
      );
      setSuccess(true);
      
      // Redirect đến trang login sau 2 giây
      setTimeout(() => {
        navigate('/login', { 
          state: { message: result || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' } 
        });
      }, 2000);
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.' 
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
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
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

      {/* Reset Password Card */}
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-green-500 mb-2">
            Đặt lại mật khẩu
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Nhập mã OTP và mật khẩu mới
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {!success && (
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
                  placeholder="Nhập email của bạn"
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

              {/* OTP Field */}
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-700 font-medium">
                  Mã OTP
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="Nhập mã OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className={`h-12 text-base ${
                    errors.otp ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  required
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="text-red-500 text-sm">{errors.otp}</p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                  Mật khẩu mới
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`h-12 text-base pr-10 ${
                      errors.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''
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
                {errors.newPassword && (
                  <p className="text-red-500 text-sm">{errors.newPassword}</p>
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
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`h-12 text-base pr-10 ${
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
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium text-base"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="text-green-500 hover:text-green-600 font-medium"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

