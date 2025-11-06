import React, { useState, useEffect } from 'react';
import { Service, ServiceService, CreateServiceRequest } from '@/services/ServiceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Settings as SettingsIcon
} from 'lucide-react';
import SimpleModal from '@/components/ui/simple-modal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { showToast } from '@/utils/toast';

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Helper function to get service ID
  const getServiceId = (service: Service | null): number | undefined => {
    return service?.serviceId || service?.id;
  };

  // Form state
  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: '',
    description: '',
    fee: 0,
    status: 'ACTIVE'
  });

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const serviceData = await ServiceService.getAllServices();
      setServices(serviceData);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      
      if (err.response?.status === 500) {
        setError('Lỗi server: API /admin/addon/services không hoạt động. Vui lòng kiểm tra backend server.');
      } else if (err.response?.status === 401) {
        setError('Bạn không có quyền truy cập API này. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền admin để truy cập API này.');
      } else {
        setError(`Lỗi kết nối: ${err.message || 'Không thể tải danh sách services'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input change
  const handleInputChange = (field: keyof CreateServiceRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle number input change
  const handleNumberInputChange = (field: keyof CreateServiceRequest, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    handleInputChange(field, numValue);
  };

  // Handle create service
  const handleCreateService = async () => {
    try {
      // Validate form data before sending
      if (!formData.name || !formData.description) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
      }
      
      if (formData.fee <= 0) {
        showToast('Phí dịch vụ phải lớn hơn 0', 'error');
        return;
      }
      
      console.log('Creating service with data:', formData);
      await ServiceService.createService(formData);
      showToast('Tạo service thành công!', 'success');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (err: any) {
      console.error('Error creating service:', err);
      showToast(`Lỗi tạo service: ${err.response?.data?.message || err.message || 'Có lỗi xảy ra'}`, 'error');
    }
  };

  // Handle update service
  const handleUpdateService = async () => {
    const serviceId = getServiceId(editingService);
    if (!serviceId) {
      console.error('Cannot update service: Invalid ID. Service data:', editingService);
      showToast('Không thể cập nhật service: ID không hợp lệ', 'error');
      return;
    }
    
    try {
      // Validate form data before sending
      if (!formData.name || !formData.description) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
      }
      
      if (formData.fee <= 0) {
        showToast('Phí dịch vụ phải lớn hơn 0', 'error');
        return;
      }
      
      console.log('Updating service with data:', formData);
      const response = await ServiceService.updateService(serviceId, formData);
      showToast(response.message || 'Cập nhật service thành công!', 'success');
      setIsEditDialogOpen(false);
      setEditingService(null);
      resetForm();
      fetchServices();
    } catch (err: any) {
      console.error('Error updating service:', err);
      showToast(`Lỗi cập nhật service: ${err.response?.data?.message || err.message || 'Có lỗi xảy ra'}`, 'error');
    }
  };

  // Handle delete service
  const handleDeleteService = async (serviceId: number) => {
    if (!serviceId) {
      showToast('Không thể xóa service: ID không hợp lệ', 'error');
      return;
    }
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa service này?')) return;
    
    try {
      const response = await ServiceService.deleteService(serviceId);
      console.log('Delete service response:', response);
      showToast(response.message || 'Xóa service thành công!', 'success');
      await fetchServices();
    } catch (err: any) {
      console.error('Error deleting service:', err);
      showToast(`Lỗi xóa service: ${err.response?.data?.message || err.message || 'Có lỗi xảy ra'}`, 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      fee: 0,
      status: 'ACTIVE'
    });
  };

  // Open detail dialog
  const openDetailDialog = (service: Service) => {
    setViewingService(service);
    setIsDetailDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (service: Service) => {
    const serviceId = getServiceId(service);
    console.log('Opening edit dialog for service:', service);
    console.log('Service ID:', serviceId);
    
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      fee: service.defaultFee || service.fee,
      status: service.status.toUpperCase() // Convert to uppercase for API
    });
    setIsEditDialogOpen(true);
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

  // Format status to proper case
  const formatStatus = (status: string) => {
    if (!status) return status;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active') return 'Active';
    if (lowerStatus === 'inactive') return 'Inactive';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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
          <p className="mt-2 text-gray-600">Đang tải danh sách services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <SettingsIcon className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchServices} variant="outline">
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
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Services</h2>
          <p className="text-gray-600">Quản lý các dịch vụ addon trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Service
          </Button>
          
          <SimpleModal
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            title="Tạo Service Mới"
            description="Điền thông tin để tạo service mới"
          >
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên Service *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nhập tên service"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Nhập mô tả service"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px] resize-y"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fee">Phí dịch vụ (VND) *</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={formData.fee}
                    onChange={(e) => handleNumberInputChange('fee', e.target.value)}
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
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateService}>
                  Tạo Service
                </Button>
              </div>
          </SimpleModal>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, mô tả, trạng thái..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid gap-4">
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Không tìm thấy service nào' : 'Chưa có service nào'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Thử thay đổi từ khóa tìm kiếm' 
                  : 'Hãy tạo service đầu tiên để bắt đầu'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Service Đầu Tiên
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredServices.map((service, index) => {
            const serviceId = getServiceId(service);
            console.log('Rendering service:', service, 'ID:', serviceId);
            return (
            <Card 
              key={serviceId || `service-${index}`} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openDetailDialog(service)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusBadgeColor(service.status)}>
                          {formatStatus(service.status) || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const serviceId = getServiceId(service);
                        if (serviceId) {
                          handleDeleteService(serviceId);
                        } else {
                          showToast('Không thể xóa service: ID không tồn tại', 'error');
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingService?.name}
              <Badge className={getStatusBadgeColor(viewingService?.status || '')}>
                {viewingService ? formatStatus(viewingService.status) : 'N/A'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Chi tiết thông tin service
            </DialogDescription>
          </DialogHeader>
          
          {viewingService && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                <Badge className={getStatusBadgeColor(viewingService.status)}>
                  {formatStatus(viewingService.status) || 'N/A'}
                </Badge>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-sm text-gray-500">Mô tả:</span>
                  <p className="text-base font-medium">{viewingService.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Phí dịch vụ:</span>
                    <p className="text-base font-semibold">
                      {formatCurrency(viewingService.defaultFee || viewingService.fee)}
                    </p>
                  </div>
                  
                  {viewingService.serviceId && (
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500">ID:</span>
                      <p className="text-base font-semibold">{viewingService.serviceId}</p>
                    </div>
                  )}
                  
                  {viewingService.createdAt && (
                    <div className="space-y-1 col-span-2">
                      <span className="text-sm text-gray-500">Tạo lúc:</span>
                      <p className="text-base font-semibold">
                        {new Date(viewingService.createdAt).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  
                  {viewingService.updatedAt && (
                    <div className="space-y-1 col-span-2">
                      <span className="text-sm text-gray-500">Cập nhật lúc:</span>
                      <p className="text-base font-semibold">
                        {new Date(viewingService.updatedAt).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    openEditDialog(viewingService);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <SimpleModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Chỉnh sửa Service"
        description="Cập nhật thông tin service"
      >
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên Service *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên service"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả *</Label>
              <textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Nhập mô tả service"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px] resize-y"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-fee">Phí dịch vụ (VND) *</Label>
              <Input
                id="edit-fee"
                type="number"
                value={formData.fee}
                onChange={(e) => handleNumberInputChange('fee', e.target.value)}
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
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateService}>
              Cập nhật Service
            </Button>
          </div>
      </SimpleModal>
    </div>
  );
};

export default ServiceManagement;

