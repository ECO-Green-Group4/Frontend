import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderService } from '@/services/OrderService';
import { UserService } from '@/services/UserService';
import { Order, OrderUser } from '@/types/api';
import { 
  Search, 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck,
  RefreshCw,
  Filter
} from 'lucide-react';
import { showToast } from '@/utils/toast';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [staffList, setStaffList] = useState<OrderUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [staffSelectOpen, setStaffSelectOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStaffList();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setHasError(false);
      const data = await OrderService.getAllOrders();
      setOrders(data);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.response?.status === 403) {
        showToast('Bạn không có quyền truy cập vào danh sách đơn hàng', 'error');
      } else if (error.response?.status === 500) {
        showToast('Lỗi server. Vui lòng thử lại sau', 'error');
      } else if (error.response?.status === 404) {
        showToast('API endpoint không tồn tại', 'error');
      } else {
        showToast('Không thể tải danh sách đơn hàng', 'error');
      }
      
      // Set empty array để tránh crash
      setOrders([]);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      // ưu tiên API lọc staff; fallback lọc phía client nếu API trả tất cả user
      const data = await UserService.getStaffList();
      const onlyStaff = Array.isArray(data)
        ? data.filter((u: any) => (u.role?.toLowerCase?.() || u.role) === 'staff')
        : [];
      setStaffList(onlyStaff);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      showToast('Không thể tải danh sách staff', 'error');
      setStaffList([]);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId.toString().includes(searchTerm) ||
        order.buyer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.seller.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleAssignStaff = async () => {
    if (!selectedOrder || !selectedStaffId) return;

    try {
      await OrderService.assignStaffToOrder(selectedOrder.orderId, selectedStaffId);
      showToast('Chỉ định staff thành công!', 'success');
      setAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedStaffId(null);
      fetchOrders(); // Refresh orders
    } catch (error: any) {
      console.error('Error assigning staff:', error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.response?.status === 403) {
        showToast('Bạn không có quyền chỉ định staff', 'error');
      } else if (error.response?.status === 500) {
        showToast('Lỗi server khi chỉ định staff. Vui lòng thử lại', 'error');
      } else if (error.response?.status === 404) {
        showToast('Không tìm thấy đơn hàng hoặc staff', 'error');
      } else {
        showToast('Không thể chỉ định staff', 'error');
      }
    }
  };

  const openAssignDialog = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStaffId(null);
    setAssignDialogOpen(true);
    // refresh staff list each time dialog opens to ensure latest data
    fetchStaffList();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'processing':
        return 'outline';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="text-gray-600">Quản lý và chỉ định staff cho các đơn hàng</p>
          </div>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>

        {/* Error State */}
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải dữ liệu</h3>
            <p className="text-gray-600 mb-4">
              Có lỗi xảy ra khi tải danh sách đơn hàng. Vui lòng kiểm tra kết nối và thử lại.
            </p>
            <Button onClick={fetchOrders} className="bg-green-500 hover:bg-green-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600">Quản lý và chỉ định staff cho các đơn hàng</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Tìm theo ID, tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Badge variant="outline" className="text-sm">
                {filteredOrders.length} đơn hàng
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng</h3>
              <p className="text-gray-600">Không tìm thấy đơn hàng nào phù hợp với bộ lọc</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.orderId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Đơn hàng #{order.orderId}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Thông tin người mua</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Tên:</strong> {order.buyer.fullName}</p>
                          <p><strong>Email:</strong> {order.buyer.email}</p>
                          <p><strong>SĐT:</strong> {order.buyer.phone}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Thông tin người bán</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Tên:</strong> {order.seller.fullName}</p>
                          <p><strong>Email:</strong> {order.seller.email}</p>
                          <p><strong>SĐT:</strong> {order.seller.phone}</p>
                        </div>
                      </div>
                    </div>

                    {order.assignedStaff && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Staff được chỉ định</h4>
                        <div className="text-sm text-gray-600">
                          <p><strong>Tên:</strong> {order.assignedStaff.fullName}</p>
                          <p><strong>Email:</strong> {order.assignedStaff.email}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => openAssignDialog(order)}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      {order.assignedStaff ? 'Thay đổi staff' : 'Chỉ định staff'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assign Staff Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉ định staff cho đơn hàng #{selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="staff">Chọn staff</Label>
              <Select
                open={staffSelectOpen}
                onOpenChange={setStaffSelectOpen}
                value={selectedStaffId !== null ? selectedStaffId.toString() : undefined}
                onValueChange={(value) => {
                  const parsed = parseInt(value, 10);
                  if (Number.isNaN(parsed)) {
                    setSelectedStaffId(null);
                    return;
                  }
                  setSelectedStaffId(parsed);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.length === 0 ? (
                    <SelectItem value="no-staff" disabled>
                      Không có staff nào
                    </SelectItem>
                  ) : (
                    staffList.map((staff) => (
                      <SelectItem key={staff.userId} value={staff.userId.toString()}>
                        {staff.fullName} ({staff.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {staffSelectOpen && (
                <div className="mt-2 h-40" />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleAssignStaff}
                disabled={!selectedStaffId || staffList.length === 0}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
