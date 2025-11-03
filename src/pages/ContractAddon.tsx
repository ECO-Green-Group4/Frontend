import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Service } from '@/services/ServiceService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Check,
  ArrowLeft,
  ShoppingCart,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react';
import { showToast } from '@/utils/toast';
import api from '@/services/axios';

interface ContractAddonRequest {
  contractId: number;
  serviceId: number;
  chargedTo: 'BUYER' | 'SELLER';
}

interface ContractAddonResponse {
  message: string;
  success: boolean;
  data: {
    id: number;
    contractId: number;
    serviceId: number;
    serviceName: string;
    fee: number;
    createdAt: string;
    paymentStatus: string;
  };
}

interface ContractAddonsResponse {
  message: string;
  success: boolean;
  data: ContractAddonResponse['data'][];
}

const ContractAddon: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractIdFromQuery = searchParams.get('contractId');
  const [contractIdInput, setContractIdInput] = useState<string>(contractIdFromQuery || '');
  const [currentContractId, setCurrentContractId] = useState<string | null>(contractIdFromQuery);
  const [services, setServices] = useState<Service[]>([]);
  const [addedAddons, setAddedAddons] = useState<ContractAddonResponse['data'][]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
  const [chargedTo, setChargedTo] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update contractId when query param changes
  useEffect(() => {
    if (contractIdFromQuery) {
      setContractIdInput(contractIdFromQuery);
      setCurrentContractId(contractIdFromQuery);
    }
  }, [contractIdFromQuery]);

  // Fetch available services and existing addons when contractId changes
  useEffect(() => {
    if (currentContractId) {
      fetchServices();
      fetchContractAddons();
    }
  }, [currentContractId]);

  const fetchServices = async () => {
    try {
      setError(null);
      // Use staff endpoint /addon/services (baseURL already includes /api)
      const response = await api.get<{ message: string; success: boolean; data: Service[] }>('/addon/services');
      const serviceData = response.data.data || [];
      
      // Only show ACTIVE services
      const activeServices = serviceData.filter(service => 
        service.status.toUpperCase() === 'ACTIVE'
      );
      setServices(activeServices);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError('Không thể tải danh sách services');
    } finally {
      setLoading(false);
    }
  };

  const fetchContractAddons = async () => {
    if (!currentContractId) return;
    try {
      const response = await api.get<ContractAddonsResponse>(`/addon/contract/${currentContractId}/addons`);
      setAddedAddons(response.data.data);
    } catch (error) {
      console.error('Error fetching contract addons:', error);
      showToast('Không thể tải danh sách addons. Vui lòng kiểm tra contractId.', 'error');
    }
  };

  // Handle contractId input submit
  const handleLoadContract = () => {
    if (!contractIdInput.trim()) {
      showToast('Vui lòng nhập Contract ID', 'error');
      return;
    }
    const contractIdNum = parseInt(contractIdInput.trim());
    if (isNaN(contractIdNum) || contractIdNum <= 0) {
      showToast('Contract ID phải là số dương', 'error');
      return;
    }
    setCurrentContractId(contractIdInput.trim());
    // Update URL without reload
    navigate(`/staff/contract-addon?contractId=${contractIdInput.trim()}`, { replace: true });
  };

  // Handle service selection
  const handleServiceToggle = (serviceId: number) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  // Check if service is already added
  const isServiceAdded = (serviceId: number) => {
    return addedAddons.some(addon => addon.serviceId === serviceId);
  };

  // Calculate total fee
  const calculateSelectedTotal = () => {
    return Array.from(selectedServices).reduce((total, serviceId) => {
      const service = services.find(s => (s.serviceId === serviceId) || (s.id === serviceId));
      // API returns defaultFee, not fee
      return total + (service?.defaultFee || service?.fee || 0);
    }, 0);
  };

  // Calculate added addons total
  const calculateAddedTotal = () => {
    return addedAddons.reduce((total, addon) => total + addon.fee, 0);
  };

  // Add services to contract
  const handleAddToContract = async () => {
    if (selectedServices.size === 0) {
      showToast('Vui lòng chọn ít nhất một service', 'error');
      return;
    }

    if (!currentContractId) {
      showToast('Vui lòng nhập Contract ID trước', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const contractIdNum = parseInt(currentContractId);
      if (!contractIdNum || isNaN(contractIdNum)) {
        throw new Error('Contract ID không hợp lệ');
      }

      // Add each selected service to contract
      const promises = Array.from(selectedServices).map(async (serviceId) => {
        const requestData: ContractAddonRequest = {
          contractId: contractIdNum,
          serviceId,
          chargedTo
        };

        console.log('📤 Sending contract addon request:', requestData);
        const response = await api.post<ContractAddonResponse>('/addon/contract-addon', requestData);
        console.log('✅ Contract addon response:', response.data);
        return response.data.data;
      });

      const results = await Promise.all(promises);
      
      showToast(`Đã thêm ${results.length} service vào contract thành công!`, 'success');
      
      // Refresh addons list
      await fetchContractAddons();
      
      // Clear selection
      setSelectedServices(new Set());
      
    } catch (err: any) {
      console.error('Error adding services to contract:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi thêm services';
      showToast(`Lỗi: ${errorMessage}`, 'error');
    } finally {
      setSubmitting(false);
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
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Show input form if no contractId loaded
  if (!currentContractId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Nhập Contract ID
              </h2>
              <p className="text-gray-600">
                Vui lòng nhập Contract ID để quản lý add-on services.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contractId">Contract ID</Label>
                <Input
                  id="contractId"
                  type="number"
                  placeholder="Nhập Contract ID (ví dụ: 1)"
                  value={contractIdInput}
                  onChange={(e) => setContractIdInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLoadContract();
                    }
                  }}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Từ database: orderId 4 → contractId = 1
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleLoadContract}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Tải Contract
                </Button>
                <Button
                  onClick={() => navigate('/staff/contracts')}
                  variant="outline"
                >
                  Quay lại
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !services.length) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Package className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/staff/contracts')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Contract Add-on Services
                </h1>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  Contract ID: <span className="font-semibold">{currentContractId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentContractId(null)}
                    className="h-6 px-2 text-xs"
                  >
                    Đổi Contract ID
                  </Button>
                </p>
              </div>
            </div>
            
            {/* Summary */}
            <div className="flex items-center gap-4 bg-green-50 px-4 py-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <div className="text-sm">
                <div className="font-medium text-green-800">
                  Đã thêm: {addedAddons.length} services
                </div>
                <div className="text-green-600">
                  {formatCurrency(calculateAddedTotal())}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Added Addons Section */}
        {addedAddons.length > 0 && (
          <Card className="mb-8 border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Services đã thêm vào Contract ({addedAddons.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addedAddons.map((addon) => (
                  <div key={addon.id} className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{addon.serviceName}</h4>
                      <span className="text-xs text-gray-500">ID: {addon.serviceId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(addon.fee)}
                      </span>
                      <Badge className={
                        addon.paymentStatus === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }>
                        {addon.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t text-center">
                <div className="text-lg font-semibold text-gray-900">
                  Tổng phí đã thêm: {formatCurrency(calculateAddedTotal())}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Services */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Chọn Service Packages</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchServices}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không có service nào khả dụng
                </h3>
                <p className="text-gray-600">
                  Hiện tại không có service nào ở trạng thái ACTIVE
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {services.map((service) => {
                    const serviceId = service.serviceId || service.id;
                    const isSelected = selectedServices.has(serviceId!);
                    const isAdded = isServiceAdded(serviceId!);
                    
                    return (
                      <Card 
                        key={serviceId} 
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isAdded 
                            ? 'bg-gray-100 opacity-60' 
                            : isSelected 
                              ? 'ring-2 ring-green-500 bg-green-50' 
                              : 'hover:shadow-md'
                        }`}
                        onClick={() => !isAdded && handleServiceToggle(serviceId!)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {service.name}
                                <Badge className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              </CardTitle>
                            </div>
                            {!isAdded && (
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleServiceToggle(serviceId!)}
                                className="ml-2"
                              />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(service.defaultFee || service.fee)}
                            </div>
                            {isAdded && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Đã thêm
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                {selectedServices.size > 0 && (
                  <div className="pt-4 border-t bg-green-50 p-6 rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-600">Đã chọn:</div>
                        <div className="text-lg font-bold text-green-700">
                          {selectedServices.size} services - {formatCurrency(calculateSelectedTotal())}
                        </div>
                      </div>
                      
                      {/* Charged To Selector */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                          Bên chịu phí:
                        </Label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setChargedTo('BUYER')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              chargedTo === 'BUYER'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            👤 BUYER (Người mua)
                          </button>
                          <button
                            onClick={() => setChargedTo('SELLER')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              chargedTo === 'SELLER'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            🏪 SELLER (Người bán)
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {chargedTo === 'BUYER' 
                            ? '💰 Người mua sẽ thanh toán các dịch vụ này'
                            : '💰 Người bán sẽ thanh toán các dịch vụ này'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddToContract}
                        disabled={submitting}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang thêm...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm vào Contract
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractAddon;
