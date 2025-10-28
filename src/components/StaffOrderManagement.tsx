import React, { useState, useEffect } from 'react';
import { StaffOrder, StaffOrderService } from '@/services/StaffOrderService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Search, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';

const StaffOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await StaffOrderService.getAllOrders();
      setOrders(orderData);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      
      if (err.response?.status === 500) {
        setError('Lỗi server: API /staff/orders không hoạt động. Vui lòng kiểm tra backend server.');
      } else if (err.response?.status === 401) {
        setError('Bạn không có quyền truy cập API này. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền staff để truy cập API này.');
      } else {
        setError(`Lỗi kết nối: ${err.message || 'Không thể tải danh sách orders'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => 
    order.buyer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.seller.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.orderId.toString().includes(searchQuery) ||
    order.listingId.toString().includes(searchQuery)
  );

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh sách orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Package className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
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
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Orders</h2>
          <p className="text-gray-600">Danh sách các đơn hàng được gán cho bạn</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
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
              <User className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đã xử lý</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
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

      {/* Orders List */}
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
              {!searchQuery && (
                <Button onClick={fetchOrders} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Làm mới
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.orderId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      Order #{order.orderId}
                      <Badge variant="outline" className="text-blue-600">
                        Listing ID: {order.listingId}
                      </Badge>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Buyer Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                      <User className="w-5 h-5 text-green-600" />
                      Thông tin Người mua
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-24">Tên:</span>
                        <span className="font-medium">{order.buyer.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 w-20">Email:</span>
                        <span className="font-medium">{order.buyer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-24">Username:</span>
                        <span className="font-medium">{order.buyer.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 w-20">SĐT:</span>
                        <span className="font-medium">{order.buyer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 w-24">Ngày sinh:</span>
                        <span className="font-medium">{formatDate(order.buyer.dateOfBirth)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-24">Giới tính:</span>
                        <span className="font-medium">{order.buyer.gender}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-24">CMND/CCCD:</span>
                        <span className="font-medium">{order.buyer.identityCard}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <span className="text-gray-500">Địa chỉ:</span>
                          <p className="font-medium">{order.buyer.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      Thông tin Người bán
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-24">Tên:</span>
                        <span className="font-medium">{order.seller.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 w-20">Email:</span>
                        <span className="font-medium">{order.seller.email}</span>
                      </div>
                      {order.seller.username && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-24">Username:</span>
                          <span className="font-medium">{order.seller.username}</span>
                        </div>
                      )}
                      {order.seller.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500 w-20">SĐT:</span>
                          <span className="font-medium">{order.seller.phone}</span>
                        </div>
                      )}
                      {order.seller.dateOfBirth && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500 w-24">Ngày sinh:</span>
                          <span className="font-medium">{formatDate(order.seller.dateOfBirth)}</span>
                        </div>
                      )}
                      {order.seller.gender && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-24">Giới tính:</span>
                          <span className="font-medium">{order.seller.gender}</span>
                        </div>
                      )}
                      {order.seller.identityCard && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 w-24">CMND/CCCD:</span>
                          <span className="font-medium">{order.seller.identityCard}</span>
                        </div>
                      )}
                      {order.seller.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <span className="text-gray-500">Địa chỉ:</span>
                            <p className="font-medium">{order.seller.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffOrderManagement;

