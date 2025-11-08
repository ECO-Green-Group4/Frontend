// Trang quên mật khẩu
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { validateForm } from '@/utils/validateEmail';
import { VALIDATION_RULES } from '@/utils/constants';
import AuthService from '@/services/AuthService';
import ecoLogo from '@/assets/logo/eco_green.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const validationRules = {
    email: [VALIDATION_RULES.EMAIL.REQUIRED, VALIDATION_RULES.EMAIL.FORMAT]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm({ email }, validationRules);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const result = await AuthService.forgotPassword(email);
      setSuccess(true);
      setMessage(result || 'OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
    } catch (error: any) {
      setSuccess(false);
      setErrors({ 
        general: error.message || 'Không thể gửi OTP. Vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToReset = () => {
    navigate('/reset-password', { 
      state: { email } 
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Xóa error khi user bắt đầu nhập
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: ''
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

      {/* Forgot Password Card */}
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-green-500 mb-2">
            Quên mật khẩu
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Nhập email của bạn để nhận mã OTP
          </p>

          {/* Success Message */}
          {success && message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {!success ? (
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
                  value={email}
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

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium text-base"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi OTP'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <Button 
                onClick={handleContinueToReset}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium text-base"
              >
                Tiếp tục đặt lại mật khẩu
              </Button>
            </div>
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

export default ForgotPassword;

