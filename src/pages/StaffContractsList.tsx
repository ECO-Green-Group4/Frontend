import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ContractService, ContractData } from '@/services/ContractService';
import { StaffOrderService } from '@/services/StaffOrderService';
import { 
  FileText, 
  CheckCircle, 
  CheckCircle2,
  Calendar,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
  Eye,
  User,
  Mail
} from 'lucide-react';
import { showToast } from '@/utils/toast';
import api from '@/services/axios';

interface ContractDetailData {
  contractId: number;
  orderId: number;
  status: string;
  sellerSigned: boolean;
  buyerSigned: boolean;
  signedAt: string;
  createdAt: string;
  buyerId?: number;
  sellerId?: number;
  addons?: Array<{
    id: number;
    contractId: number;
    serviceId: number;
    serviceName: string;
    fee: number;
    createdAt: string;
    paymentStatus: string;
    chargedTo?: string;
  }>;
}

interface ContractWithDetails {
  contract: ContractData;
  details: ContractDetailData;
  canComplete: boolean;
}

const StaffContractsList: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [completingContractId, setCompletingContractId] = useState<number | null>(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy tất cả orders được assign cho staff
      const orders = await StaffOrderService.getAllOrders();
      
      // Lấy contract cho mỗi order và fetch details
      const contractsWithDetails: ContractWithDetails[] = [];
      
      await Promise.all(
        orders.map(async (order) => {
          try {
            const contractData = await ContractService.getContractByOrderId(order.orderId);
            
            // Chỉ lấy contracts đã được tạo
            if (contractData && contractData.contractId) {
              try {
                // Fetch contract details
                const res = await api.get(`/contract/contractDetails/${contractData.contractId}`);
                const detailData = res.data?.data || res.data;
                
                // Kiểm tra điều kiện có thể complete
                const canComplete = checkCanComplete(contractData, detailData);
                
                // Chỉ hiển thị contracts đã được signed (cả hai bên)
                if (detailData.buyerSigned && detailData.sellerSigned) {
                  contractsWithDetails.push({
                    contract: contractData,
                    details: detailData,
                    canComplete
                  });
                }
              } catch (err: any) {
                console.warn(`Error fetching contract details for contract ${contractData.contractId}:`, err);
              }
            }
          } catch (err: any) {
            // Ignore errors for orders without contracts
            if (err.response?.status !== 404 && err.response?.status !== 500) {
              console.warn(`Error processing order ${order.orderId}:`, err);
            }
          }
        })
      );
      
      // Sắp xếp theo ngày tạo (mới nhất trước)
      contractsWithDetails.sort((a, b) => 
        new Date(b.contract.createdAt).getTime() - new Date(a.contract.createdAt).getTime()
      );
      
      setContracts(contractsWithDetails);
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      setError('Không thể tải danh sách contracts');
      showToast('Không thể tải danh sách contracts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkCanComplete = (contract: ContractData, details: ContractDetailData): boolean => {
    // Contract chưa được completed
    if (contract.status === 'COMPLETED') return false;
    
    // Cả hai bên phải đã ký
    if (!details.buyerSigned || !details.sellerSigned) return false;
    
    // Tất cả add-ons phải đã thanh toán (nếu có)
    if (details.addons && details.addons.length > 0) {
      const allPaid = details.addons.every(addon => addon.paymentStatus === 'PAID');
      if (!allPaid) return false;
    }
    
    return true;
  };

  const handleCompleteContract = async (contractId: number) => {
    try {
      setCompletingContractId(contractId);
      await ContractService.completeContract(contractId);
      showToast('Đã hoàn thành hợp đồng thành công!', 'success');
      
      // Refresh danh sách
      await fetchContracts();
    } catch (err: any) {
      console.error('Complete contract error:', err);
      const errorMessage = err.message || 'Hoàn thành hợp đồng thất bại. Vui lòng thử lại.';
      showToast(errorMessage, 'error');
    } finally {
      setCompletingContractId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'DRAFT': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'PENDING': 'bg-blue-100 text-blue-800 border-blue-300',
      'SIGNED': 'bg-green-100 text-green-800 border-green-300',
      'COMPLETED': 'bg-purple-100 text-purple-800 border-purple-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
    };

    const color = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    
    return (
      <Badge className={color}>
        {status}
      </Badge>
    );
  };

  const filteredContracts = contracts.filter(contractWithDetails => {
    const contract = contractWithDetails.contract;
    const details = contractWithDetails.details;
    
    return (
      contract.contractId.toString().includes(searchQuery) ||
      contract.orderId.toString().includes(searchQuery) ||
      contract.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách Contracts</h2>
          <p className="text-gray-600">Quản lý và hoàn thành các hợp đồng đã được ký</p>
        </div>
        <Button onClick={fetchContracts} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tổng Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đã ký</p>
                <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle2 className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Có thể hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => c.canComplete).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo Contract ID, Order ID, trạng thái..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Lỗi</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải danh sách contracts...</p>
          </div>
        </div>
      )}

      {/* Contracts List */}
      {!loading && (
        <div className="grid gap-4">
          {filteredContracts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'Không tìm thấy contract nào' : 'Chưa có contract nào được ký'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? 'Thử thay đổi từ khóa tìm kiếm' 
                    : 'Các contracts đã được cả hai bên ký sẽ hiển thị ở đây'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredContracts.map(({ contract, details, canComplete }) => (
              <Card key={contract.contractId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        <FileText className="w-5 h-5" />
                        Contract #{contract.contractId}
                        <Badge variant="outline" className="text-blue-600">
                          Order #{contract.orderId}
                        </Badge>
                        {getStatusBadge(contract.status)}
                        {contract.status === 'COMPLETED' && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                            Đã hoàn thành
                          </Badge>
                        )}
                        {canComplete && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Sẵn sàng hoàn thành
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/contract/${contract.contractId}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                      {canComplete && (
                        <Button
                          onClick={() => handleCompleteContract(contract.contractId)}
                          disabled={completingContractId === contract.contractId}
                          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {completingContractId === contract.contractId 
                            ? 'Đang hoàn thành...' 
                            : 'Hoàn thành hợp đồng'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Contract Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Ngày tạo:</span>
                          <span>{formatDate(contract.createdAt)}</span>
                        </div>
                        {contract.signedAt && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Ngày ký:</span>
                            <span>{formatDate(contract.signedAt)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className={`w-4 h-4 ${details.buyerSigned ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className="font-medium">Người mua:</span>
                          <span className={details.buyerSigned ? 'text-green-700' : 'text-gray-500'}>
                            {details.buyerSigned ? 'Đã ký' : 'Chưa ký'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className={`w-4 h-4 ${details.sellerSigned ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className="font-medium">Người bán:</span>
                          <span className={details.sellerSigned ? 'text-green-700' : 'text-gray-500'}>
                            {details.sellerSigned ? 'Đã ký' : 'Chưa ký'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add-ons Info */}
                    {details.addons && details.addons.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Dịch vụ đi kèm:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {details.addons.map((addon) => (
                            <div key={addon.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                              <span className="text-gray-700">{addon.serviceName}</span>
                              <Badge className={
                                addon.paymentStatus === 'PAID' 
                                  ? 'bg-green-100 text-green-700 border-green-300' 
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              }>
                                {addon.paymentStatus}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Tất cả add-ons đã thanh toán: {
                            details.addons.every(a => a.paymentStatus === 'PAID') ? (
                              <span className="text-green-700 font-medium">✓ Có</span>
                            ) : (
                              <span className="text-yellow-700 font-medium">✗ Chưa</span>
                            )
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StaffContractsList;

