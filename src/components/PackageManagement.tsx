import React, { useState, useEffect } from 'react';
import { Package, PackageService, CreatePackageRequest } from '@/services/PackageService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package as PackageIcon,
  Filter
} from 'lucide-react';
import SimpleModal from '@/components/ui/simple-modal';
import { showToast } from '@/utils/toast';

const PackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreatePackageRequest>({
    name: '',
    packageType: 'LISTING_BASIC',
    listingLimit: 0,
    listingFee: 0,
    highlight: false,
    durationDays: 0,
    commissionDiscount: 0,
    status: 'ACTIVE'
  });

  // Fetch packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const packageData = await PackageService.getAllPackages();
      setPackages(packageData);
    } catch (err: any) {
      console.error('Error fetching packages:', err);
      
      if (err.response?.status === 500) {
        setError('Lỗi server: API /admin/packages không hoạt động. Vui lòng kiểm tra backend server.');
      } else if (err.response?.status === 401) {
        setError('Bạn không có quyền truy cập API này. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền admin để truy cập API này.');
      } else {
        setError(`Lỗi kết nối: ${err.message || 'Không thể tải danh sách packages'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Filter packages
  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.packageType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input change
  const handleInputChange = (field: keyof CreatePackageRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle number input change
  const handleNumberInputChange = (field: keyof CreatePackageRequest, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    handleInputChange(field, numValue);
  };

  // Handle create package
  const handleCreatePackage = async () => {
    try {
      // Validate form data before sending
      if (!formData.name || !formData.packageType) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
      }
      
      console.log('Creating package with data:', formData);
      await PackageService.createPackage(formData);
      showToast('Tạo package thành công!', 'success');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchPackages();
    } catch (err: any) {
      console.error('Error creating package:', err);
      showToast(`Lỗi tạo package: ${err.response?.data?.message || err.message || 'Có lỗi xảy ra'}`, 'error');
    }
  };

  // Handle update package
  const handleUpdatePackage = async () => {
    if (!editingPackage?.id) {
      showToast('Không thể cập nhật package: ID không hợp lệ', 'error');
      return;
    }
    
    try {
      // Validate form data before sending
      if (!formData.name || !formData.packageType) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
      }
      
      console.log('Updating package with data:', formData);
      const response = await PackageService.updatePackage(editingPackage.id, formData);
      showToast(response.message || 'Cập nhật package thành công!', 'success');
      setIsEditDialogOpen(false);
      setEditingPackage(null);
      resetForm();
      fetchPackages();
    } catch (err: any) {
      console.error('Error updating package:', err);
      showToast(`Lỗi cập nhật package: ${err.response?.data?.message || err.message || 'Có lỗi xảy ra'}`, 'error');
    }
  };

  // Handle delete package
  const handleDeletePackage = async (packageId: number) => {
    if (!packageId) {
      showToast('Không thể xóa package: ID không hợp lệ', 'error');
      return;
    }
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa package này?')) return;
    
    try {
      const response = await PackageService.deletePackage(packageId);
      console.log('Delete package response:', response);
      showToast(response.message || 'Xóa package thành công!', 'success');
      // Refresh danh sách packages sau khi xóa thành công
      await fetchPackages();
    } catch (err: any) {
      console.error('Error deleting package:', err);
      showToast(`Lỗi xóa package: ${err.response?.data?.message || err.message || 'Có lỗi xảy ra'}`, 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      packageType: 'LISTING_BASIC',
      listingLimit: 0,
      listingFee: 0,
      highlight: false,
      durationDays: 0,
      commissionDiscount: 0,
      status: 'ACTIVE'
    });
  };

  // Open edit dialog
  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      packageType: pkg.packageType,
      listingLimit: pkg.listingLimit,
      listingFee: pkg.listingFee,
      highlight: pkg.highlight,
      durationDays: pkg.durationDays,
      commissionDiscount: pkg.commissionDiscount,
      status: pkg.status
    });
    setIsEditDialogOpen(true);
  };

  // Get package type badge color
  const getPackageTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'LISTING_VIP':
        return 'bg-purple-100 text-purple-800';
      case 'LISTING_PREMIUM':
        return 'bg-blue-100 text-blue-800';
      case 'LISTING_BASIC':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh sách packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <PackageIcon className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchPackages} variant="outline">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Packages</h2>
          <p className="text-gray-600">Quản lý các gói membership trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Package
          </Button>
          
          <SimpleModal
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            title="Tạo Package Mới"
            description="Điền thông tin để tạo package mới"
          >
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên Package</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nhập tên package"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="packageType">Loại Package</Label>
                  <select
                    id="packageType"
                    value={formData.packageType}
                    onChange={(e) => handleInputChange('packageType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="LISTING_BASIC">Basic</option>
                    <option value="LISTING_PREMIUM">Premium</option>
                    <option value="LISTING_VIP">VIP</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="listingLimit">Giới hạn Listing</Label>
                  <Input
                    id="listingLimit"
                    type="number"
                    value={formData.listingLimit}
                    onChange={(e) => handleNumberInputChange('listingLimit', e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="listingFee">Phí Listing (VND)</Label>
                  <Input
                    id="listingFee"
                    type="number"
                    value={formData.listingFee}
                    onChange={(e) => handleNumberInputChange('listingFee', e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Thời hạn (ngày)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => handleNumberInputChange('durationDays', e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commissionDiscount">Giảm giá hoa hồng (%)</Label>
                  <Input
                    id="commissionDiscount"
                    type="number"
                    value={formData.commissionDiscount}
                    onChange={(e) => handleNumberInputChange('commissionDiscount', e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2 col-span-2">
                  <input
                    type="checkbox"
                    id="highlight"
                    checked={formData.highlight}
                    onChange={(e) => handleInputChange('highlight', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="highlight">Highlight Package</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreatePackage}>
                  Tạo Package
                </Button>
              </div>
          </SimpleModal>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, loại package, trạng thái..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages List */}
      <div className="grid gap-4">
        {filteredPackages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <PackageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Không tìm thấy package nào' : 'Chưa có package nào'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Thử thay đổi từ khóa tìm kiếm' 
                  : 'Hãy tạo package đầu tiên để bắt đầu'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Package Đầu Tiên
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPackages.map((pkg, index) => {
            console.log('Rendering package:', pkg);
            return (
            <Card key={pkg.id || `package-${index}`} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {pkg.name}
                      <Badge className={getPackageTypeBadgeColor(pkg.packageType)}>
                        {pkg.packageType.replace('LISTING_', '')}
                      </Badge>
                      {pkg.highlight && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Highlight
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Trạng thái: <Badge className={getStatusBadgeColor(pkg.status)}>{pkg.status || 'N/A'}</Badge></span>
                      <span>Thời hạn: {pkg.durationDays || 0} ngày</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(pkg)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pkg.id ? handleDeletePackage(pkg.id) : showToast('Không thể xóa package: ID không tồn tại', 'error')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Giới hạn Listing:</span>
                    <p className="font-semibold">{pkg.listingLimit}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phí Listing:</span>
                    <p className="font-semibold">{formatCurrency(pkg.listingFee)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Giảm giá hoa hồng:</span>
                    <p className="font-semibold">{pkg.commissionDiscount}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tạo lúc:</span>
                    <p className="font-semibold">
                      {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      <SimpleModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Chỉnh sửa Package"
        description="Cập nhật thông tin package"
      >
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên Package</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên package"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-packageType">Loại Package</Label>
              <select
                id="edit-packageType"
                value={formData.packageType}
                onChange={(e) => handleInputChange('packageType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="LISTING_BASIC">Basic</option>
                <option value="LISTING_PREMIUM">Premium</option>
                <option value="LISTING_VIP">VIP</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-listingLimit">Giới hạn Listing</Label>
              <Input
                id="edit-listingLimit"
                type="number"
                value={formData.listingLimit}
                onChange={(e) => handleNumberInputChange('listingLimit', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-listingFee">Phí Listing (VND)</Label>
              <Input
                id="edit-listingFee"
                type="number"
                value={formData.listingFee}
                onChange={(e) => handleNumberInputChange('listingFee', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-durationDays">Thời hạn (ngày)</Label>
              <Input
                id="edit-durationDays"
                type="number"
                value={formData.durationDays}
                onChange={(e) => handleNumberInputChange('durationDays', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-commissionDiscount">Giảm giá hoa hồng (%)</Label>
              <Input
                id="edit-commissionDiscount"
                type="number"
                value={formData.commissionDiscount}
                onChange={(e) => handleNumberInputChange('commissionDiscount', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 col-span-2">
              <input
                type="checkbox"
                id="edit-highlight"
                checked={formData.highlight}
                onChange={(e) => handleInputChange('highlight', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-highlight">Highlight Package</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdatePackage}>
              Cập nhật Package
            </Button>
          </div>
      </SimpleModal>
    </div>
  );
};

export default PackageManagement;
