import React, { useState, useEffect } from 'react';
// === IMPORT THÊM PostStatus ===
import { Post, PostService } from '@/services/PostService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Trash2, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  ChevronDown,
  Filter
} from 'lucide-react';
import { showToast } from '@/utils/toast';

const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch listings (user submissions)
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const listingData = await PostService.getAllPosts();
      setPosts(listingData);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      
      if (err.response?.status === 500) {
        setError('Lỗi server: API /admin/listings không hoạt động. Vui lòng kiểm tra backend server.');
      } else if (err.response?.status === 401) {
        setError('Bạn không có quyền truy cập API này. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền admin để truy cập API này.');
      } else {
        setError(`Lỗi kết nối: ${err.message || 'Không thể tải danh sách listings'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user?.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handle approve listing - chuyển thành ACTIVE
  const handleApproveListing = async (postId: number) => {
    try {
      console.log('handleApproveListing called with postId:', postId);
      console.log('postId type:', typeof postId);
      
      if (!postId || postId === undefined) {
        showToast('Lỗi: Không tìm thấy ID của bài đăng', 'error');
        return;
      }
      
      await PostService.updatePostStatus(postId, 'ACTIVE');
      showToast('Cập nhật trạng thái thành công!', 'success');
      fetchPosts();
    } catch (error: any) {
      showToast(`Lỗi cập nhật: ${error.message}`, 'error');
    }
  };

  // Handle reject listing - chuyển thành REJECTED
  const handleRejectListing = async (postId: number) => {
    try {
      console.log('handleRejectListing called with postId:', postId);
      console.log('postId type:', typeof postId);
      
      if (!postId || postId === undefined) {
        showToast('Lỗi: Không tìm thấy ID của bài đăng', 'error');
        return;
      }
      
      await PostService.updatePostStatus(postId, 'REJECTED');
      showToast('Cập nhật trạng thái thành công!', 'success');
      fetchPosts();
    } catch (error: any) {
      showToast(`Lỗi cập nhật: ${error.message}`, 'error');
    }
  };

  // Handle soft delete listing (chuyển sang INACTIVE thay vì xóa)
  const handleSoftDeleteListing = async (postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hóa listing này?')) return;
    
    try {
      console.log('Attempting to soft delete listing with ID:', postId);
      
      if (!postId || postId === undefined || postId === null) {
        showToast('Lỗi: Không tìm thấy ID của listing', 'error');
        return;
      }
      
      // Chuyển status sang INACTIVE thay vì xóa
      await PostService.updatePostStatus(postId, 'INACTIVE');
      showToast('Vô hiệu hóa listing thành công!', 'success');
      fetchPosts();
    } catch (error: any) {
      console.error('Soft delete listing error details:', error);
      showToast(`Lỗi vô hiệu hóa listing: ${error.message}`, 'error');
    }
  };

  // Handle delete listing
  const handleDeleteListing = async (postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa listing này?')) return;
    
    try {
      console.log('Attempting to delete listing with ID:', postId);
      console.log('PostId type:', typeof postId);
      
      if (!postId || postId === undefined || postId === null) {
        showToast('Lỗi: Không tìm thấy ID của listing', 'error');
        return;
      }
      
      await PostService.deletePost(postId);
      showToast('Xóa listing thành công!', 'success');
      fetchPosts();
    } catch (error: any) {
      console.error('Delete listing error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Lỗi xóa listing';
      
      // Xử lý các loại lỗi khác nhau
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('Data integrity violation')) {
          errorMessage = 'Không thể xóa listing này vì đang có dữ liệu liên quan (thanh toán, gói dịch vụ, v.v.). Hãy thử "Vô hiệu hóa" thay vì "Xóa vĩnh viễn".';
        } else if (error.response?.data?.message?.includes('foreign key')) {
          errorMessage = 'Không thể xóa listing này vì đang được sử dụng trong hệ thống. Hãy thử "Vô hiệu hóa" thay vì "Xóa vĩnh viễn".';
        } else {
          errorMessage = `Lỗi dữ liệu: ${error.response?.data?.message || 'Dữ liệu không hợp lệ'}`;
        }
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền xóa listing này.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy listing để xóa.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Lỗi xóa listing';
      }
      
      showToast(errorMessage, 'error');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_APPROVAL':
        return 'bg-orange-100 text-orange-800';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'PENDING_APPROVAL':
        return <Clock className="w-4 h-4" />;
      case 'DRAFT':
        return <FileText className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
   }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <div className="text-red-500 mb-4">
          <FileText className="w-16 h-16 mx-auto mb-2" />
          <h2 className="text-xl font-semibold">Lỗi tải dữ liệu</h2>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <Button onClick={fetchPosts} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duyệt Listings</h1>
          <p className="text-gray-600">Duyệt và quản lý các bài đăng từ user</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tổng Listings</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Đã Duyệt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.filter(p => p.status === 'APPROVED' || p.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Chờ Duyệt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.filter(p => p.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Bản Nháp</p>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.filter(p => p.status === 'DRAFT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Bị Từ Chối</p>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.filter(p => p.status === 'REJECTED').length}
                </p>
          _     </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc và Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-4">
              {/* Status Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[140px] justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      {statusFilter === 'all' ? 'Tất cả trạng thái' : 
                       statusFilter === 'DRAFT' ? 'Bản nháp' :
                       statusFilter === 'PENDING' ? 'Chờ duyệt' :
                       statusFilter === 'APPROVED' ? 'Đã duyệt' :
                       statusFilter === 'REJECTED' ? 'Bị từ chối' : 'Trạng thái'}
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="px-2 py-1.5 text-sm font-medium">Lọc theo trạng thái</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-2 cursor-pointer ${statusFilter === 'all' ? 'bg-accent' : ''}`}
                  >
                    <span className="text-sm">Tất cả trạng thái</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('DRAFT')}
                    className={`px-2 py-2 cursor-pointer flex items-center ${statusFilter === 'DRAFT' ? 'bg-accent' : ''}`}
                  >
                    <FileText className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Bản nháp</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('PENDING')}
                    className={`px-2 py-2 cursor-pointer flex items-center ${statusFilter === 'PENDING' ? 'bg-accent' : ''}`}
                  >
                    <Clock className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Chờ duyệt</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('PENDING_APPROVAL')}
                    className={`px-2 py-2 cursor-pointer flex items-center ${statusFilter === 'PENDING_APPROVAL' ? 'bg-accent' : ''}`}
                  >
                    <Clock className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Chờ duyệt (Đã thanh toán)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('APPROVED')}
                    className={`px-2 py-2 cursor-pointer flex items-center ${statusFilter === 'APPROVED' ? 'bg-accent' : ''}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Đã duyệt</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('REJECTED')}
                    className={`px-2 py-2 cursor-pointer flex items-center ${statusFilter === 'REJECTED' ? 'bg-accent' : ''}`}
                  >
                    <XCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Bị từ chối</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('INACTIVE')}
                    className={`px-2 py-2 cursor-pointer flex items-center ${statusFilter === 'INACTIVE' ? 'bg-accent' : ''}`}
                  >
                    <XCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Vô hiệu hóa</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[140px] justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      {categoryFilter === 'all' ? 'Tất cả loại' : 
                       categoryFilter === 'EV' ? 'Xe điện' :
                       categoryFilter === 'BATTERY' ? 'Pin' :
                       categoryFilter === 'ACCESSORY' ? 'Phụ kiện' : 'Loại'}
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="px-2 py-1.5 text-sm font-medium">Lọc theo loại</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2 py-2 cursor-pointer ${categoryFilter === 'all' ? 'bg-accent' : ''}`}
                  >
                    <span className="text-sm">Tất cả loại</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setCategoryFilter('EV')}
                    className={`px-2 py-2 cursor-pointer flex items-center ${categoryFilter === 'EV' ? 'bg-accent' : ''}`}
                  >
                    <span className="text-lg mr-3 flex-shrink-0">🚗</span>
                    <span className="text-sm">Xe điện</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setCategoryFilter('BATTERY')}
                    className={`px-2 py-2 cursor-pointer flex items-center ${categoryFilter === 'BATTERY' ? 'bg-accent' : ''}`}
                  >
                    <span className="text-lg mr-3 flex-shrink-0">🔋</span>
                    <span className="text-sm">Pin</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setCategoryFilter('ACCESSORY')}
                    className={`px-2 py-2 cursor-pointer flex items-center ${categoryFilter === 'ACCESSORY' ? 'bg-accent' : ''}`}
                  >
                    <span className="text-lg mr-3 flex-shrink-0">🔧</span>
                    <span className="text-sm">Phụ kiện</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
            Danh sách Posts ({filteredPosts.length})
          </h3>
        </div>

        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có listings nào</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                 ? 'Không tìm thấy listings phù hợp với bộ lọc.'
                  : 'Chưa có listings nào từ user trong hệ thống.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              console.log('Rendering post:', post);
              console.log('Post ID:', post.id);
              console.log('Post listingId:', post.listingId);
              const postId = post.id || post.listingId;
              console.log('Using postId:', postId);
              return (
              <Card key={postId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusBadgeColor(post.status)}>
                          {getStatusIcon(post.status)}
                          <span className="ml-1">{post.status}</span>
                    </Badge>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                    </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSoftDeleteListing(postId!)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      title="Vô hiệu hóa listing (an toàn)"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteListing(postId!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Xóa vĩnh viễn (có thể gặp lỗi)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
               </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.description || post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                   <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatPrice(post.price)}
                      </div>
                    <div className="flex items-center">
                     <User className="w-4 h-4 mr-1" />
                        {post.user?.fullName || 'Unknown'}
                      </div>
                 </div>
                    
                    {post.createdAt && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(post.createdAt)}
                      </div>
                    )}

                    {/* ===== KHỐI NÂNG CẤP: ADMIN ACTIONS ===== */}
                    <div className="flex gap-2 pt-2">
                      {post.status === 'DRAFT' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApproveListing(postId!)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleRejectListing(postId!)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </>
                      )}

                      {post.status === 'PENDING' && (
                        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                          <span className="text-red-600 font-medium">⚠️ Bài đăng chưa thanh toán</span>
                          <br />
                          <span>User cần thanh toán trước khi admin có thể duyệt</span>
                        </div>
                      )}

                      {post.status === 'DRAFT' && (
                        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                          <span className="text-blue-600 font-medium">📝 Bài đăng nháp</span>
                          <br />
                          <span>User cần hoàn thiện và thanh toán trước khi admin có thể duyệt</span>
                        </div>
                      )}

                      {post.status === 'PENDING_APPROVAL' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApproveListing(postId!)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleRejectListing(postId!)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </>
                      )}

                    {(post.status === 'APPROVED' || post.status === 'ACTIVE') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleRejectListing(postId!)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Gỡ bài (Reject)
                      </Button>
                    )}

                    {post.status === 'INACTIVE' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveListing(postId!)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Kích hoạt lại
                      </Button>
                    )}

                    {post.status === 'REJECTED' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveListing(postId!)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Duyệt lại (Activate)
                      </Button>
                    )}
                    </div>
               </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default PostManagement;