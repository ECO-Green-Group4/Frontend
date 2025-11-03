import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ContractService, ContractData } from '@/services/ContractService';
import { StaffOrderService, StaffOrder } from '@/services/StaffOrderService';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Loader2,
  AlertCircle,
  Package,
  User,
  Mail,
  Search,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { showToast } from '@/utils/toast';

const ContractManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatingOrderId, setGeneratingOrderId] = useState<number | null>(null);
  const [completingContractId, setCompletingContractId] = useState<number | null>(null);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setError(null);
      const orderData = await StaffOrderService.getAllOrders();
      setOrders(orderData);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleGenerateContract = async (orderId: number) => {
    try {
      setGeneratingOrderId(orderId);
      setError(null);
      setContract(null);
      const contractData = await ContractService.generateContract(orderId);
      
      // Validate contractData before using it
      if (!contractData || !contractData.contractId) {
        throw new Error('Contract data is invalid or missing contractId');
      }
      
      setContract(contractData);
      showToast('Tạo contract thành công!', 'success');
      
      // Navigate to add-on page after successful contract creation
      navigate(`/staff/contract-addon?contractId=${contractData.contractId}`);
      
      // Refresh orders after creating contract (to get updated contract status)
      fetchOrders();
    } catch (err: any) {
      console.error('Error generating contract:', err);
      
      // Check if contract already exists
      const errorMessage = err.message || '';
      if (errorMessage.includes('Contract already exists') || errorMessage.includes('contract already exists')) {
        // Backend không trả về contractId khi contract đã tồn tại
        // Redirect đến trang add-on để staff có thể nhập contractId
        showToast('Contract đã tồn tại. Chuyển đến trang Add-on để nhập Contract ID...', 'info');
        navigate(`/staff/contract-addon`);
        return;
      }
      
      // Handle other errors
      let finalErrorMessage = 'Không thể tạo contract';
      
      if (err.response) {
        if (err.response.status === 404) {
          finalErrorMessage = 'Không tìm thấy order với ID này';
        } else if (err.response.status === 400) {
          finalErrorMessage = err.response.data?.message || 'Dữ liệu không hợp lệ';
        } else if (err.response.status === 401 || err.response.status === 403) {
          finalErrorMessage = 'Bạn không có quyền tạo contract';
        } else if (err.response.status === 500) {
          finalErrorMessage = 'Lỗi server. Vui lòng thử lại sau';
        } else {
          finalErrorMessage = err.response.data?.message || finalErrorMessage;
        }
      } else if (err.message) {
        finalErrorMessage = err.message;
      }
      
      setError(finalErrorMessage);
      showToast(finalErrorMessage, 'error');
    } finally {
      setGeneratingOrderId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => 
    order.buyer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.seller.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.orderId.toString().includes(searchQuery) ||
    order.listingId.toString().includes(searchQuery)
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Handler hoàn thành contract bằng orderId
  const handleCompleteContract = async (orderId: number) => {
    try {
      setCompletingContractId(orderId);
      const contractId = await ContractService.completeContractByOrderId(orderId);
      console.log(`✅ Contract ${contractId} completed for order ${orderId}`);
      showToast('Đã xác nhận hoàn tất order thành công!', 'success');
      
      // Refresh orders để cập nhật trạng thái (sẽ tự động fetch lại contract với status COMPLETED)
      await fetchOrders();
    } catch (err: any) {
      console.error('Complete contract error:', err);
      const errorMessage = err.message || 'Xác nhận hoàn tất order thất bại. Vui lòng thử lại.';
      showToast(errorMessage, 'error');
    } finally {
      setCompletingContractId(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Contract</h2>
          <p className="text-gray-600">Chọn order để tạo contract</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" disabled={loadingOrders}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingOrders ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tổng Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Có thể tạo contract</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
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
              placeholder="Tìm kiếm theo tên, email, order ID, listing ID..."
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
      {loadingOrders && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải danh sách orders...</p>
          </div>
        </div>
      )}

      {/* Orders List */}
      {!loadingOrders && (
        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'Không tìm thấy order nào' : 'Chưa có order nào được gán'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? 'Thử thay đổi từ khóa tìm kiếm' 
                    : 'Các orders được admin gán sẽ hiển thị ở đây'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              return (
                <Card key={order.orderId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 flex-wrap">
                          Order #{order.orderId}
                          <Badge variant="outline" className="text-blue-600">
                            Listing ID: {order.listingId}
                          </Badge>
                        </CardTitle>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleGenerateContract(order.orderId)}
                          disabled={generatingOrderId === order.orderId}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {generatingOrderId === order.orderId ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang tạo...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4 mr-2" />
                              Tạo Contract
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleCompleteContract(order.orderId)}
                          disabled={completingContractId === order.orderId}
                          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {completingContractId === order.orderId 
                            ? 'Đang xác nhận...' 
                            : 'Xác nhận hoàn tất'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Buyer Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                          <User className="w-4 h-4 text-green-600" />
                          Người mua: {order.buyer.fullName}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {order.buyer.email}
                          </div>
                        </div>
                      </div>

                      {/* Seller Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          Người bán: {order.seller.fullName}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {order.seller.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Contract Details */}
      {contract && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Contract đã được tạo thành công
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Contract Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Contract ID:</span>
                    <p className="text-lg font-semibold text-gray-900">#{contract.contractId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Order ID:</span>
                    <p className="text-lg font-semibold text-gray-900">#{contract.orderId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                    <div className="mt-1">
                      {getStatusBadge(contract.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày tạo:
                    </span>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(contract.createdAt)}</p>
                  </div>
                  {contract.signedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Ngày ký:
                      </span>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(contract.signedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Signing Status */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Trạng thái ký kết</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${
                    contract.buyerSigned 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {contract.buyerSigned ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Người mua</span>
                    </div>
                    <p className={`text-sm ${contract.buyerSigned ? 'text-green-700' : 'text-gray-500'}`}>
                      {contract.buyerSigned ? 'Đã ký' : 'Chưa ký'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    contract.sellerSigned 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {contract.sellerSigned ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-700">Người bán</span>
                    </div>
                    <p className={`text-sm ${contract.sellerSigned ? 'text-green-700' : 'text-gray-500'}`}>
                      {contract.sellerSigned ? 'Đã ký' : 'Chưa ký'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractManagement;

