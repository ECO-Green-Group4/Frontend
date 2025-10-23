import React, { useState, useEffect, useMemo } from 'react';
import { User, UserService } from '@/services/UserService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  MoreVertical, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { showToast } from '@/utils/toast';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'true' | 'null'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await UserService.getAllUsers();
      setUsers(userData);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      
      // Kiểm tra loại lỗi
      if (err.response?.status === 500) {
        setError('Lỗi server: API /admin/user không hoạt động. Vui lòng kiểm tra backend server.');
      } else if (err.response?.status === 401) {
        setError('Bạn không có quyền truy cập API này. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền admin để truy cập API này.');
      } else {
        setError(`Lỗi kết nối: ${err.message || 'Không thể tải danh sách user'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fallback data khi API không hoạt động
  const mockUsers: User[] = [
    {
      userId: 1,
      fullName: "System Administrator",
      email: "admin@evmarket.com",
      username: "admin",
      phone: "0123456789",
      role: "admin",
      status: "active",
      dateOfBirth: "1990-01-01",
      gender: "male",
      identityCard: "123456789",
      address: "System Address",
      createdAt: "2024-01-01T00:00:00Z",
      currentMembershipId: null,
      membershipExpiry: null,
      availableCoupons: null
    },
    {
      userId: 2,
      fullName: "John Doe",
      email: "john@example.com",
      username: "johndoe",
      phone: "0987654321",
      role: "member",
      status: "active",
      dateOfBirth: "1995-05-15",
      gender: "male",
      identityCard: "987654321",
      address: "123 Main Street, City",
      createdAt: "2024-01-15T10:30:00Z",
      currentMembershipId: 1,
      membershipExpiry: "2024-12-31T23:59:59Z",
      availableCoupons: 5
    }
  ];

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'null' && user.status === null) ||
        (statusFilter === 'active' && user.status === 'active') ||
        (statusFilter === 'true' && user.status === 'true');
        
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Handle user actions
  const handleToggleStatus = async (userId: number, currentStatus: string | null) => {
    try {
      const newStatus = currentStatus === 'active' || currentStatus === 'true' ? false : true;
      await UserService.toggleUserStatus(userId, newStatus);
      showToast(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} user`, 'success');
      fetchUsers(); // Refresh the list
    } catch (error) {
      showToast('Không thể thay đổi trạng thái user', 'error');
    }
  };


  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'active' || status === 'true') {
      return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
    } else if (status === null) {
      return <Badge className="bg-gray-100 text-gray-800">Chưa kích hoạt</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin'
      ? <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
      : <Badge className="bg-blue-100 text-blue-800">Member</Badge>;
  };

  const formatGender = (gender: string) => {
    if (!gender) return 'N/A';
    
    const genderLower = gender.toLowerCase();
    
    // Kiểm tra các trường hợp "Nam"
    if (genderLower === 'male' || genderLower === 'nam' || genderLower === 'm') {
      return 'Nam';
    }
    
    // Kiểm tra các trường hợp "Nữ"
    if (genderLower === 'female' || genderLower === 'nữ' || genderLower === 'nu' || genderLower === 'f') {
      return 'Nữ';
    }
    
    // Nếu không khớp với pattern nào, trả về giá trị gốc
    return gender;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách user...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={fetchUsers} variant="outline">
            Thử lại
          </Button>
          <Button 
            onClick={() => {
              setUsers(mockUsers);
              setError(null);
            }} 
            variant="secondary"
          >
            Sử dụng dữ liệu mẫu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý User</h2>
          <p className="text-gray-600">Quản lý tất cả user trong hệ thống</p>
        </div>
        <div className="text-sm text-gray-500">
          Tổng: {users.length} user | Hiển thị: {filteredUsers.length} user
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, username, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Tất cả
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Hoạt động
              </Button>
              <Button
                variant={statusFilter === 'true' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('true')}
                size="sm"
              >
                Đã kích hoạt
              </Button>
              <Button
                variant={statusFilter === 'null' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('null')}
                size="sm"
              >
                Chưa kích hoạt
              </Button>
            </div>

            {/* Role Filter */}
            <div className="flex gap-2">
              <Button
                variant={roleFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setRoleFilter('all')}
                size="sm"
              >
                Tất cả
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'default' : 'outline'}
                onClick={() => setRoleFilter('admin')}
                size="sm"
              >
                Admin
              </Button>
              <Button
                variant={roleFilter === 'member' ? 'default' : 'outline'}
                onClick={() => setRoleFilter('member')}
                size="sm"
              >
                Member
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy user nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.userId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-lg">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{user.fullName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(user.status)}
                          {getRoleBadge(user.role)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(user.dateOfBirth)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Username:</span>
                        <span>{user.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Giới tính:</span>
                        <span>{formatGender(user.gender)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">CCCD:</span>
                        <span>{user.identityCard}</span>
                      </div>
                    </div>

                    {user.address && (
                      <div className="flex items-start gap-2 mt-3 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{user.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user.userId, user.status)}
                        >
                          {user.status === 'active' || user.status === 'true' ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Vô hiệu hóa
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Kích hoạt
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default UserManagement;
