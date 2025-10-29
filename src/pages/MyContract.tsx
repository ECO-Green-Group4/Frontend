import React, { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Calendar,
  RefreshCw,
  Eye,
  Package,
  AlertCircle
} from 'lucide-react';
import { showToast } from '@/utils/toast';
import api from '@/services/axios';
import { useNavigate } from 'react-router-dom';

interface ContractData {
  contractId: number;
  orderId: number;
  status: string;
  sellerSigned: boolean;
  buyerSigned: boolean;
  signedAt: string;
  createdAt: string;
}

interface MyContractsResponse {
  message: string;
  success: boolean;
  data: ContractData[];
}

const MyContract: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyContracts();
  }, []);

  const fetchMyContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<MyContractsResponse>('/contract/my-contracts');
      setContracts(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching my contracts:', err);
      if (err.response?.status === 401) {
        setError('Bạn cần đăng nhập để xem contracts');
        showToast('Vui lòng đăng nhập lại', 'error');
      } else {
        setError('Không thể tải danh sách contracts');
        showToast('Có lỗi xảy ra khi tải contracts', 'error');
      }
    } finally {
      setLoading(false);
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
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
    };

    const color = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    
    return (
      <Badge className={color}>
        {status}
      </Badge>
    );
  };

  const handleViewContract = (contractId: number) => {
    // Navigate to contract detail page or staff contract page with contractId
    navigate(`/staff-contract?contractId=${contractId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải contracts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchMyContracts} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Contracts</h1>
          <p className="text-gray-600 mt-1">Danh sách contracts của bạn</p>
        </div>
        <Button onClick={fetchMyContracts} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => c.buyerSigned && c.sellerSigned).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Chưa ký</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => !c.buyerSigned || !c.sellerSigned).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => c.status === 'DRAFT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có contract nào
            </h3>
            <p className="text-gray-600">
              Bạn chưa có contract nào trong hệ thống
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.contractId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      Contract #{contract.contractId}
                      {getStatusBadge(contract.status)}
                      <Badge variant="outline" className="text-blue-600">
                        Order ID: {contract.orderId}
                      </Badge>
                    </CardTitle>
                  </div>
                  <Button
                    onClick={() => handleViewContract(contract.contractId)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Status */}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Trạng thái</span>
                    <div className="mt-1">
                      {getStatusBadge(contract.status)}
                    </div>
                  </div>

                  {/* Signing Status */}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Trạng thái ký kết</span>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        {contract.buyerSigned ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${contract.buyerSigned ? 'text-green-700' : 'text-gray-600'}`}>
                          Người mua: {contract.buyerSigned ? 'Đã ký' : 'Chưa ký'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {contract.sellerSigned ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${contract.sellerSigned ? 'text-green-700' : 'text-gray-600'}`}>
                          Người bán: {contract.sellerSigned ? 'Đã ký' : 'Chưa ký'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày tạo
                    </span>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(contract.createdAt)}</p>
                  </div>

                  {/* Signed Date */}
                  <div>
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày ký
                    </span>
                    <p className="text-sm text-gray-900 mt-1">
                      {contract.signedAt ? formatDate(contract.signedAt) : 'Chưa ký'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default MyContract;
