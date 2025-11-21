import React, { useState, useEffect } from 'react';
import { 
  Mail, Calendar, User, Phone, MapPin, FileText, Loader2, Edit, X, Check, Lock, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import api from '@/services/axios';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/utils/toast';
import AuthService from '@/services/AuthService'; 

// 1. Định nghĩa TypeScript interface khớp với Java DTO
interface UserInfo {
  userId: number;
  fullName: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  status: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  identityCard: string | null;
  address: string | null;
  createdAt: string; // LocalDateTime sẽ được chuyển thành string (ISO format)
}

// Component nhỏ để hiển thị từng dòng thông tin cho gọn
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | null | undefined }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value || 'Chưa cập nhật'}</p>
    </div>
  </div>
);


const Profile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [resetPasswordStep, setResetPasswordStep] = useState<'send-otp' | 'reset'>('send-otp');
  const { updateProfileComplete } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    identityCard: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Reset Password form state
  const [resetPasswordData, setResetPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState<Record<string, string>>({});
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2. Fetch dữ liệu từ backend khi component được mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // API endpoint để lấy thông tin user hiện tại là 
        const response = await api.get('/auth/me'); //không cso controller để gọi và lấy 
        setUserInfo(response.data);
        
        // Pre-fill form với dữ liệu hiện có
        if (response.data) {
          setFormData({
            phone: response.data.phone || '',
            address: response.data.address || '',
            dateOfBirth: response.data.dateOfBirth || '',
            gender: response.data.gender || 'male',
            identityCard: response.data.identityCard || '',
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
        setError("Không thể tải được thông tin cá nhân. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  // Mở dialog chỉnh sửa
  const handleOpenEdit = () => {
    if (userInfo) {
      setFormData({
        phone: userInfo.phone || '',
        address: userInfo.address || '',
        dateOfBirth: userInfo.dateOfBirth || '',
        gender: userInfo.gender || 'male',
        identityCard: userInfo.identityCard || '',
      });
      setFormErrors({});
      setIsEditDialogOpen(true);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^09\d{8}$/.test(formData.phone.trim().replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại phải bắt đầu bằng 09 và có 10 số';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    }
    
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Ngày sinh là bắt buộc';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        errors.dateOfBirth = 'Ngày sinh không thể trong tương lai';
      }
    }
    
    if (!formData.gender) {
      errors.gender = 'Giới tính là bắt buộc';
    }
    
    if (!formData.identityCard.trim()) {
      errors.identityCard = 'CMND/CCCD là bắt buộc';
    } else if (!/^[0-9]{9,12}$/.test(formData.identityCard)) {
      errors.identityCard = 'CMND/CCCD không hợp lệ (9-12 số)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfileComplete({
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        identityCard: formData.identityCard.trim(),
      });

      // Refresh user info
      const response = await api.get('/auth/me');
      setUserInfo(response.data);
      
      showToast('Cập nhật profile thành công!', 'success');
      setIsEditDialogOpen(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errorMessage = err.message || 'Không thể cập nhật profile. Vui lòng thử lại.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error khi user bắt đầu nhập
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 3. Hiển thị trạng thái Loading hoặc Error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
        <p className="ml-4 text-lg text-gray-600">Đang tải trang cá nhân...</p>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
             <p className="text-lg text-red-600">{error || 'Không tìm thấy thông tin người dùng.'}</p>
             <Button onClick={() => window.location.reload()} className="mt-4">Thử lại</Button>
        </div>
    );
  }
  
  // 4. Hiển thị giao diện chính sau khi có dữ liệu
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* === Card thông tin chính === */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-200">
              <span className="text-5xl font-bold text-green-600">
                {userInfo.fullName ? userInfo.fullName.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{userInfo.fullName}</h1>
              <p className="text-gray-500 mt-1">@{userInfo.username}</p>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-sm">
                <Calendar size={14} />
                <span>Tham gia từ {new Date(userInfo.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <Button 
              onClick={handleOpenEdit}
              className="ml-auto bg-green-500 hover:bg-green-600 text-white mt-4 sm:mt-0"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>

          {/* === Card chi tiết thông tin === */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Thông tin chi tiết</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InfoRow icon={<Mail size={20} />} label="Email" value={userInfo.email} />
              <InfoRow icon={<Phone size={20} />} label="Số điện thoại" value={userInfo.phone} />
              <InfoRow icon={<User size={20} />} label="Giới tính" value={userInfo.gender} />
              <InfoRow icon={<Calendar size={20} />} label="Ngày sinh" value={userInfo.dateOfBirth} />
              <InfoRow icon={<FileText size={20} />} label="Số CCCD" value={userInfo.identityCard} />
              <div>
                {/* Reset Password Button */}
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      setResetPasswordData({ email: userInfo.email || '', otp: '', newPassword: '', confirmPassword: '' });
                      setResetPasswordStep('send-otp');
                      setResetPasswordErrors({});
                      setIsResetPasswordDialogOpen(true);
                    }}
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Đặt lại mật khẩu
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2">
                <InfoRow icon={<MapPin size={20} />} label="Địa chỉ" value={userInfo.address} />
              </div>
            </div>
           
          </div>

        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Chỉnh sửa thông tin cá nhân</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin bổ sung cho tài khoản của bạn
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                className={formErrors.phone ? 'border-red-500' : ''}
                maxLength={10}
                required
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                className={formErrors.address ? 'border-red-500' : ''}
                required
              />
              {formErrors.address && (
                <p className="text-sm text-red-500">{formErrors.address}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={formErrors.dateOfBirth ? 'border-red-500' : ''}
                required
              />
              {formErrors.dateOfBirth && (
                <p className="text-sm text-red-500">{formErrors.dateOfBirth}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính *</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.gender ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              {formErrors.gender && (
                <p className="text-sm text-red-500">{formErrors.gender}</p>
              )}
            </div>

            {/* Identity Card */}
            <div className="space-y-2">
              <Label htmlFor="identityCard">CMND/CCCD *</Label>
              <Input
                id="identityCard"
                name="identityCard"
                type="text"
                value={formData.identityCard}
                onChange={handleChange}
                placeholder="123456789012"
                className={formErrors.identityCard ? 'border-red-500' : ''}
                required
              />
              {formErrors.identityCard && (
                <p className="text-sm text-red-500">{formErrors.identityCard}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Cập nhật
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              {resetPasswordStep === 'send-otp' 
                ? 'Nhập email để nhận mã OTP'
                : 'Nhập mã OTP và mật khẩu mới'}
            </DialogDescription>
          </DialogHeader>

          {resetPasswordStep === 'send-otp' ? (
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                  // Clear previous errors
                  setResetPasswordErrors({});
                  
                  // Validate email
                  if (!resetPasswordData.email || !resetPasswordData.email.trim()) {
                    setResetPasswordErrors({ email: 'Email là bắt buộc' });
                    return;
                  }
                  
                  const emailRegex = /^[^\s@]+@gmail\.com$/;
                  if (!emailRegex.test(resetPasswordData.email.trim())) {
                    setResetPasswordErrors({ email: 'Email phải có đuôi @gmail.com' });
                    return;
                  }

                  setResetPasswordLoading(true);
                  
                  // Send OTP
                  await AuthService.forgotPassword(resetPasswordData.email.trim());
                  showToast('OTP đã được gửi đến email của bạn', 'success');
                  setResetPasswordStep('reset');
                } catch (error: any) {
                  console.error('Error sending OTP:', error);
                  const errorMessage = error?.message || 'Không thể gửi OTP. Vui lòng thử lại.';
                  setResetPasswordErrors({ general: errorMessage });
                  showToast(errorMessage, 'error');
                } finally {
                  setResetPasswordLoading(false);
                }
              }}
              className="space-y-4"
            >
              {resetPasswordErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {resetPasswordErrors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetPasswordData.email}
                  onChange={(e) => {
                    setResetPasswordData(prev => ({ ...prev, email: e.target.value }));
                    if (resetPasswordErrors.email) {
                      setResetPasswordErrors(prev => ({ ...prev, email: '' }));
                    }
                    if (resetPasswordErrors.general) {
                      setResetPasswordErrors(prev => ({ ...prev, general: '' }));
                    }
                  }}
                  placeholder="example@gmail.com"
                  className={resetPasswordErrors.email ? 'border-red-500' : ''}
                  required
                />
                {resetPasswordErrors.email && (
                  <p className="text-sm text-red-500">{resetPasswordErrors.email}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsResetPasswordDialogOpen(false);
                    setResetPasswordErrors({});
                  }}
                  disabled={resetPasswordLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={resetPasswordLoading}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {resetPasswordLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi OTP'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                  // Clear previous errors
                  setResetPasswordErrors({});
                  
                  // Validate form manually
                  const errors: Record<string, string> = {};
                  
                  // Validate email
                  if (!resetPasswordData.email || !resetPasswordData.email.trim()) {
                    errors.email = 'Email là bắt buộc';
                  } else {
                    const emailRegex = /^[^\s@]+@gmail\.com$/;
                    if (!emailRegex.test(resetPasswordData.email.trim())) {
                      errors.email = 'Email phải có đuôi @gmail.com';
                    }
                  }
                  
                  // Validate OTP
                  if (!resetPasswordData.otp || !resetPasswordData.otp.trim()) {
                    errors.otp = 'Mã OTP là bắt buộc';
                  } else if (resetPasswordData.otp.trim().length < 4) {
                    errors.otp = 'Mã OTP phải có ít nhất 4 ký tự';
                  }
                  
                  // Validate password
                  if (!resetPasswordData.newPassword || !resetPasswordData.newPassword.trim()) {
                    errors.newPassword = 'Mật khẩu là bắt buộc';
                  } else {
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
                    if (!passwordRegex.test(resetPasswordData.newPassword)) {
                      errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
                    }
                  }
                  
                  // Kiểm tra xác nhận mật khẩu
                  if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
                    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
                  }
                  
                  setResetPasswordErrors(errors);
                  if (Object.keys(errors).length > 0) {
                    return;
                  }

                  setResetPasswordLoading(true);
                  
                  await AuthService.resetPassword(
                    resetPasswordData.email.trim(),
                    resetPasswordData.otp.trim(),
                    resetPasswordData.newPassword
                  );
                  showToast('Đặt lại mật khẩu thành công!', 'success');
                  setIsResetPasswordDialogOpen(false);
                  setResetPasswordStep('send-otp');
                  setResetPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                } catch (error: any) {
                  console.error('Error resetting password:', error);
                  const errorMessage = error?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
                  setResetPasswordErrors({ general: errorMessage });
                  showToast(errorMessage, 'error');
                } finally {
                  setResetPasswordLoading(false);
                }
              }}
              className="space-y-4"
            >
              {resetPasswordErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {resetPasswordErrors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-otp">Mã OTP</Label>
                <Input
                  id="reset-otp"
                  type="text"
                  value={resetPasswordData.otp}
                  onChange={(e) => {
                    setResetPasswordData(prev => ({ ...prev, otp: e.target.value }));
                    if (resetPasswordErrors.otp) {
                      setResetPasswordErrors(prev => ({ ...prev, otp: '' }));
                    }
                  }}
                  placeholder="Nhập mã OTP"
                  className={resetPasswordErrors.otp ? 'border-red-500' : ''}
                  maxLength={6}
                  required
                />
                {resetPasswordErrors.otp && (
                  <p className="text-sm text-red-500">{resetPasswordErrors.otp}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-new-password">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="reset-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={resetPasswordData.newPassword}
                    onChange={(e) => {
                      setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                      if (resetPasswordErrors.newPassword) {
                        setResetPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                      }
                    }}
                    placeholder="Nhập mật khẩu mới"
                    className={resetPasswordErrors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {resetPasswordErrors.newPassword && (
                  <p className="text-sm text-red-500">{resetPasswordErrors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => {
                      setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                      if (resetPasswordErrors.confirmPassword) {
                        setResetPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    className={resetPasswordErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
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
                {resetPasswordErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{resetPasswordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResetPasswordStep('send-otp');
                    setResetPasswordErrors({});
                  }}
                  disabled={resetPasswordLoading}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={resetPasswordLoading}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {resetPasswordLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Profile;