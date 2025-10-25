// Trang đăng nhập
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/utils/adminCheck';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { validateForm } from '@/utils/validateEmail';
import { VALIDATION_RULES } from '@/utils/constants';
import ecoLogo from '@/assets/logo/eco_green.png';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Lấy redirect path từ state hoặc mặc định về trang chủ
  const from = location.state?.from?.pathname || '/';

  const validationRules = {
    email: [VALIDATION_RULES.EMAIL.REQUIRED, VALIDATION_RULES.EMAIL.FORMAT],
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
      
      // Kiểm tra nếu user là admin thì redirect đến admin dashboard
      if (isAdmin(response.user)) {
        navigate('/admin', { replace: true });
      } else {
        // Redirect về trang trước đó hoặc trang chủ cho user thường
        navigate(from === '/admin' ? '/' : from, { replace: true });
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

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
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

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-green-500 mb-8">
            Log in
          </h1>

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
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
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
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
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
