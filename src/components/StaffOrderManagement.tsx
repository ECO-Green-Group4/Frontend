import React, { useState, useEffect } from 'react';
import { 
  StaffOrder, 
  StaffOrderService, 
  StaffOrderListingDetail 
} from '@/services/StaffOrderService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Package, 
  Search, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  RefreshCw,
  Eye,
  DollarSign
} from 'lucide-react';
import { showToast } from '@/utils/toast';

const StaffOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state for listing detail
  const [selectedListing, setSelectedListing] = useState<StaffOrderListingDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // View listing detail - sử dụng orderId từ API mới
  const handleViewListingDetail = async (orderId: number) => {
    try {
      setLoadingDetail(true);
      console.log('📋 Opening listing detail for order:', orderId);
      
      // Sử dụng API mới: GET /api/staff/orders/{orderId}/listing
      const detail = await StaffOrderService.getOrderListingDetail(orderId);
      console.log('✅ Order listing detail response:', detail);
      
      setSelectedListing(detail);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      console.error('❌ Error loading listing detail:', error);
      let errorMessage = 'Không thể tải chi tiết bài đăng';
      
      if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền xem chi tiết bài đăng này';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy bài đăng cho order này';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server: Vui lòng thử lại sau';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showToast(`Lỗi tải chi tiết: ${errorMessage}`, 'error');
    } finally {
      setLoadingDetail(false);
    }
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
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      Order #{order.orderId}
                      <Badge variant="outline" className="text-blue-600">
                        Listing ID: {order.listingId}
                      </Badge>
                    </CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewListingDetail(order.orderId)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Xem chi tiết bài đăng
                  </Button>
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

      {/* Modal Chi tiết Listing */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Chi tiết Bài đăng
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết bài đăng từ listing
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : selectedListing ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={`text-base py-2 px-4 ${
                    selectedListing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    selectedListing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedListing.status}
                  </Badge>
                  <Badge variant="outline" className="text-base py-2 px-4">
                    {selectedListing.itemType === 'battery' ? '🔋 Pin' : selectedListing.itemType === 'vehicle' ? '🚗 Xe' : selectedListing.itemType}
                  </Badge>
                  {selectedListing.postType && (
                    <Badge variant="outline" className="text-base py-2 px-4">
                      Loại: {selectedListing.postType}
                    </Badge>
                  )}
                </div>
                <span className="text-base font-medium text-gray-600">
                  Listing ID: {selectedListing.listingId}
                </span>
              </div>

              {/* Basic Info */}
              <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedListing.title}
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed">{selectedListing.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Giá</p>
                      <p className="font-bold text-lg text-green-600">{formatCurrency(selectedListing.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm</p>
                      <p className="font-semibold text-base">{selectedListing.location || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày tạo</p>
                      <p className="font-semibold text-base">
                        {selectedListing.createdAt ? formatDate(selectedListing.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Package Info */}
                {selectedListing.listingPackageId && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-base text-blue-900 mb-2 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Thông tin Package
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Package ID:</p>
                        <p className="font-semibold">{selectedListing.listingPackageId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Số tiền:</p>
                        <p className="font-semibold text-green-600">{formatCurrency(selectedListing.packageAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Trạng thái:</p>
                        <Badge variant="outline" className="mt-1">
                          {selectedListing.packageStatus}
                        </Badge>
                      </div>
                      {selectedListing.packageExpiredAt && (
                        <div className="col-span-3">
                          <p className="text-gray-600">Hết hạn:</p>
                          <p className="font-semibold">{formatDate(selectedListing.packageExpiredAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Info */}
              {selectedListing.user && (
                <Card className="shadow-md">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="w-6 h-6 text-blue-600" />
                      Thông tin người đăng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Họ tên</p>
                        <p className="font-semibold text-base">{selectedListing.user.fullName}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Username</p>
                        <p className="font-semibold text-base">{selectedListing.user.username || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="font-semibold text-base break-all">{selectedListing.user.email}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                        <p className="font-semibold text-base">{selectedListing.user.phone || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Ngày sinh</p>
                        <p className="font-semibold text-base">{formatDate(selectedListing.user.dateOfBirth)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Giới tính</p>
                        <p className="font-semibold text-base">{selectedListing.user.gender}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">CMND/CCCD</p>
                        <p className="font-semibold text-base">{selectedListing.user.identityCard}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                        <p className="font-semibold text-base">{selectedListing.user.address}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                        <Badge variant="outline" className="mt-1">
                          {selectedListing.user.status}
                        </Badge>
                      </div>
                      {selectedListing.user.membershipExpiry && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Hết hạn membership</p>
                          <p className="font-semibold text-base">{formatDate(selectedListing.user.membershipExpiry)}</p>
                        </div>
                      )}
                      {selectedListing.user.availableCoupons !== null && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Coupons khả dụng</p>
                          <p className="font-semibold text-base">{selectedListing.user.availableCoupons}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vehicle Details */}
              {selectedListing.itemType === 'vehicle' && (
                <Card className="shadow-md">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      🚗 Thông tin Xe điện
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Hãng xe</p>
                        <p className="font-semibold text-base">{selectedListing.brand || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Model</p>
                        <p className="font-semibold text-base">{selectedListing.model || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Năm sản xuất</p>
                        <p className="font-semibold text-base">{selectedListing.year || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Dung lượng pin</p>
                        <p className="font-semibold text-base">
                          {selectedListing.batteryCapacity ? `${selectedListing.batteryCapacity} kWh` : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Số km đã đi</p>
                        <p className="font-semibold text-base">
                          {selectedListing.mileage ? `${selectedListing.mileage.toLocaleString()} km` : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Tình trạng</p>
                        <p className="font-semibold text-base">{selectedListing.condition || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Loại thân xe</p>
                        <p className="font-semibold text-base">{selectedListing.bodyType || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Màu sắc</p>
                        <p className="font-semibold text-base">{selectedListing.color || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Kiểm định</p>
                        <p className="font-semibold text-base">{selectedListing.inspection || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Xuất xứ</p>
                        <p className="font-semibold text-base">{selectedListing.origin || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Số chỗ ngồi</p>
                        <p className="font-semibold text-base">{selectedListing.numberOfSeats || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Biển số xe</p>
                        <p className="font-semibold text-base">{selectedListing.licensePlate || 'N/A'}</p>
                      </div>
                      {selectedListing.accessories && (
                        <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Phụ kiện</p>
                          <p className="font-semibold text-base">{selectedListing.accessories}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Battery Details */}
              {selectedListing.itemType === 'battery' && (
                <Card className="shadow-md">
                  <CardHeader className="bg-yellow-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      🔋 Thông tin Pin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Hãng pin</p>
                        <p className="font-semibold text-base">{selectedListing.batteryBrand || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Loại pin</p>
                        <p className="font-semibold text-base">{selectedListing.type || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Điện áp</p>
                        <p className="font-semibold text-base">{selectedListing.voltage ? `${selectedListing.voltage}V` : 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Dung lượng</p>
                        <p className="font-semibold text-base">{selectedListing.capacity || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Tình trạng sức khỏe</p>
                        <p className="font-semibold text-base text-green-600">
                          {selectedListing.healthPercent ? `${selectedListing.healthPercent}%` : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Năm sản xuất</p>
                        <p className="font-semibold text-base">{selectedListing.manufactureYear || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Chu kỳ sạc</p>
                        <p className="font-semibold text-base">{selectedListing.chargeCycles || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Xuất xứ</p>
                        <p className="font-semibold text-base">{selectedListing.origin || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              {selectedListing.images && selectedListing.images.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader className="bg-indigo-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      📸 Hình ảnh ({selectedListing.images.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-6">
                      {selectedListing.images.map((image, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden shadow-md border border-gray-200">
                          <img
                            src={image}
                            alt={`${selectedListing.title} - Ảnh ${index + 1}`}
                            className="w-full h-64 object-contain bg-white"
                            crossOrigin="anonymous"
                            loading="lazy"
                            onError={(e) => {
                              console.error('❌ Image load error:', image);
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%239ca3af"%3E⚠️ Ảnh không tải được%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute top-3 left-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full font-medium">
                            {index + 1}/{selectedListing.images?.length || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsDetailModalOpen(false)}
              className="min-w-[120px]"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffOrderManagement;

