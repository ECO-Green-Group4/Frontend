import React, { useState, useEffect, useMemo } from 'react';
// === IMPORT THÊM PostStatus ===
import { Post, PostService } from '@/services/PostService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Filter,
  Eye,
  MapPin,
  Package
} from 'lucide-react';
import { showToast } from '@/utils/toast';

const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modal state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  // Filter and sort posts (newest first)
  const filteredPosts = useMemo(() => {
    // Debug: Log first post to check category structure
    if (posts.length > 0 && categoryFilter !== 'all') {
      console.log('First post category check:', {
        category: posts[0].category,
        itemType: posts[0].itemType,
        categoryFilter,
        post: posts[0]
      });
    }
    
    return posts
      .filter(post => {
        const matchesSearch = !searchQuery || 
          post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          // Search by category (Vietnamese keywords)
          (searchQuery.toLowerCase().includes('xe điện') && post.category?.toUpperCase() === 'EV') ||
          (searchQuery.toLowerCase().includes('pin') && post.category?.toUpperCase() === 'BATTERY') ||
          (searchQuery.toLowerCase() === 'ev' && post.category?.toUpperCase() === 'EV') ||
          (searchQuery.toLowerCase() === 'battery' && post.category?.toUpperCase() === 'BATTERY') ||
          // Direct category match
          post.category?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'APPROVED' && (post.status?.toUpperCase() === 'APPROVED' || post.status?.toUpperCase() === 'ACTIVE')) ||
          (statusFilter !== 'APPROVED' && post.status?.toUpperCase() === statusFilter.toUpperCase());
        // Category filter - check both category and itemType
        const postCategory = post.category || post.itemType;
        const normalizedPostCategory = postCategory?.toUpperCase();
        const normalizedFilter = categoryFilter.toUpperCase();
        
        // Map itemType to category if needed
        let categoryMatch = false;
        if (categoryFilter === 'all') {
          categoryMatch = true;
        } else if (normalizedFilter === 'EV') {
          // Match EV category or vehicle itemType
          categoryMatch = normalizedPostCategory === 'EV' || 
                         normalizedPostCategory === 'VEHICLE' ||
                         post.itemType?.toUpperCase() === 'VEHICLE' ||
                         post.itemType?.toLowerCase() === 'vehicle';
        } else if (normalizedFilter === 'BATTERY') {
          // Match BATTERY category or battery itemType
          categoryMatch = normalizedPostCategory === 'BATTERY' ||
                         post.itemType?.toUpperCase() === 'BATTERY' ||
                         post.itemType?.toLowerCase() === 'battery';
        } else {
          categoryMatch = normalizedPostCategory === normalizedFilter;
        }
        
        const matchesCategory = categoryMatch;
        
        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        // Sort by createdAt descending (newest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order
      });
  }, [posts, searchQuery, statusFilter, categoryFilter]);

  // View listing detail
  const handleViewDetail = async (postId: number) => {
    try {
      setLoadingDetail(true);
      console.log('📋 Opening detail modal for listing:', postId);
      
      // Tìm post từ danh sách hiện có trước
      const existingPost = posts.find(p => (p.id || p.listingId) === postId);
      
      if (existingPost) {
        console.log('✅ Using existing post data from list');
        setSelectedPost(existingPost);
        setIsDetailModalOpen(true);
        setLoadingDetail(false);
      } else {
        console.log('🔍 Post not found in list, fetching from API...');
        const detail = await PostService.getPostById(postId);
        setSelectedPost(detail);
        setIsDetailModalOpen(true);
      }
    } catch (error: any) {
      console.error('❌ Error loading detail:', error);
      showToast(`Lỗi tải chi tiết: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle approve listing - chuyển thành ACTIVE
  const handleApproveListing = async (postId: number, closeModal: boolean = false) => {
    try {
      console.log('✅ Approving listing with postId:', postId);
      
      if (!postId || postId === undefined) {
        showToast('Lỗi: Không tìm thấy ID của bài đăng', 'error');
        return;
      }
      
      const response = await PostService.updatePostStatus(postId, 'ACTIVE');
      console.log('✅ Approve response:', response);
      
      // Hiển thị message từ backend
      showToast(response.message || 'Duyệt bài đăng thành công!', 'success');
      
      if (closeModal) {
        setIsDetailModalOpen(false);
        setSelectedPost(null);
      }
      
      // Refresh danh sách để cập nhật status mới
      await fetchPosts();
    } catch (error: any) {
      console.error('❌ Error approving listing:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
      showToast(`Lỗi duyệt bài: ${errorMessage}`, 'error');
    }
  };

  // Handle reject listing - chuyển thành REJECTED
  const handleRejectListing = async (postId: number, closeModal: boolean = false) => {
    try {
      console.log('❌ Rejecting listing with postId:', postId);
      
      if (!postId || postId === undefined) {
        showToast('Lỗi: Không tìm thấy ID của bài đăng', 'error');
        return;
      }
      
      const response = await PostService.updatePostStatus(postId, 'REJECTED');
      console.log('✅ Reject response:', response);
      
      // Hiển thị message từ backend
      showToast(response.message || 'Từ chối bài đăng thành công!', 'success');
      
      if (closeModal) {
        setIsDetailModalOpen(false);
        setSelectedPost(null);
      }
      
      // Refresh danh sách để cập nhật status mới
      await fetchPosts();
    } catch (error: any) {
      console.error('❌ Error rejecting listing:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
      showToast(`Lỗi từ chối bài: ${errorMessage}`, 'error');
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
                       'Loại'}
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
                    {/* Description hidden */}
                    {/* <p className="text-gray-600 text-sm line-clamp-3">
                      {post.description || post.content}
                    </p> */}
                    
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
                      {/* Nút xem chi tiết luôn hiển thị */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewDetail(postId!)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem chi tiết
                      </Button>
                      
                      {post.status === 'DRAFT' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleViewDetail(postId!)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Duyệt
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
                            onClick={() => handleViewDetail(postId!)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                        </>
                      )}

                    {(post.status === 'APPROVED' || post.status === 'ACTIVE') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleViewDetail(postId!)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Gỡ bài
                      </Button>
                    )}

                    {post.status === 'INACTIVE' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleViewDetail(postId!)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Kích hoạt lại
                      </Button>
                    )}

                    {post.status === 'REJECTED' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleViewDetail(postId!)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Duyệt lại
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

      {/* Modal Chi tiết Listing */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Chi tiết Bài đăng
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết và quyết định duyệt hoặc từ chối bài đăng
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : selectedPost ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <Badge className={getStatusBadgeColor(selectedPost.status) + " text-base py-2 px-4"}>
                  {getStatusIcon(selectedPost.status)}
                  <span className="ml-2">{selectedPost.status}</span>
                </Badge>
                <span className="text-base font-medium text-gray-600">
                  ID: {selectedPost.id || selectedPost.listingId}
                </span>
              </div>

              {/* Basic Info */}
              <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedPost.title}
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed">{selectedPost.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Giá</p>
                      <p className="font-bold text-lg text-green-600">{formatPrice(selectedPost.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm</p>
                      <p className="font-semibold text-base">{selectedPost.location || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày tạo</p>
                      <p className="font-semibold text-base">
                        {selectedPost.createdAt ? formatDate(selectedPost.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout 2 cột cho User Info và Vehicle/Battery Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Info */}
                {selectedPost.user && (
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
                          <p className="font-semibold text-base">{selectedPost.user.fullName}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Username</p>
                          <p className="font-semibold text-base">{selectedPost.user.username || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <p className="font-semibold text-base break-all">{selectedPost.user.email}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                          <p className="font-semibold text-base">{selectedPost.user.phone || 'N/A'}</p>
                        </div>
                        {selectedPost.user.dateOfBirth && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Ngày sinh</p>
                            <p className="font-semibold text-base">{formatDate(selectedPost.user.dateOfBirth)}</p>
                          </div>
                        )}
                        {selectedPost.user.gender && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Giới tính</p>
                            <p className="font-semibold text-base">{selectedPost.user.gender}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Vehicle/Battery Details */}
                {selectedPost.itemType === 'vehicle' ? (
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
                          <p className="font-semibold text-base">{selectedPost.brand || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Mẫu xe</p>
                          <p className="font-semibold text-base">{selectedPost.model || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Năm sản xuất</p>
                          <p className="font-semibold text-base">{selectedPost.year || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Xuất xứ</p>
                          <p className="font-semibold text-base">{selectedPost.origin || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Màu sắc</p>
                          <p className="font-semibold text-base">{selectedPost.color || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Số chỗ ngồi</p>
                          <p className="font-semibold text-base">{selectedPost.numberOfSeats || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Biển số</p>
                          <p className="font-semibold text-base">{selectedPost.licensePlate || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Tình trạng</p>
                          <p className="font-semibold text-base">{selectedPost.condition || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Số km đã đi</p>
                          <p className="font-semibold text-base">{selectedPost.mileage ? `${selectedPost.mileage} km` : 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Dung lượng pin</p>
                          <p className="font-semibold text-base">{selectedPost.batteryCapacity ? `${selectedPost.batteryCapacity} kWh` : 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : selectedPost.itemType === 'battery' ? (
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
                          <p className="font-semibold text-base">{selectedPost.batteryBrand || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Loại pin</p>
                          <p className="font-semibold text-base">{selectedPost.type || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Điện áp</p>
                          <p className="font-semibold text-base">{selectedPost.voltage ? `${selectedPost.voltage}V` : 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Dung lượng</p>
                          <p className="font-semibold text-base">{selectedPost.capacity || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Tình trạng sức khỏe</p>
                          <p className="font-semibold text-base text-green-600">
                            {selectedPost.healthPercent ? `${selectedPost.healthPercent}%` : 'N/A'}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Năm sản xuất</p>
                          <p className="font-semibold text-base">{selectedPost.manufactureYear || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Chu kỳ sạc</p>
                          <p className="font-semibold text-base">{selectedPost.chargeCycles || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Xuất xứ</p>
                          <p className="font-semibold text-base">{selectedPost.origin || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              {/* Package Info */}
              {selectedPost.listingPackageId && (
                <Card className="shadow-md">
                  <CardHeader className="bg-purple-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Package className="w-6 h-6 text-purple-600" />
                      Thông tin Gói dịch vụ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">ID Gói</p>
                        <p className="font-semibold text-base">{selectedPost.listingPackageId}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Số tiền</p>
                        <p className="font-semibold text-base text-purple-600">
                          {selectedPost.packageAmount ? formatPrice(selectedPost.packageAmount) : 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                        <p className="font-semibold text-base">{selectedPost.packageStatus || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Ngày hết hạn</p>
                        <p className="font-semibold text-base">
                          {selectedPost.packageExpiredAt ? formatDate(selectedPost.packageExpiredAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              {selectedPost.images && selectedPost.images.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader className="bg-indigo-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      📸 Hình ảnh ({selectedPost.images.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-6">
                      {selectedPost.images.map((image, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden shadow-md border border-gray-200">
                          <img
                            src={image}
                            alt={`${selectedPost.title} - Ảnh ${index + 1}`}
                            className="w-full h-64 object-contain bg-white"
                            crossOrigin="anonymous"
                            loading="lazy"
                            onError={(e) => {
                              console.error('❌ Image load error:', image);
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%239ca3af"%3E⚠️ Ảnh không tải được%3C/text%3E%3C/svg%3E';
                            }}
                            onLoad={() => {
                              console.log('✅ Image loaded successfully:', image);
                            }}
                          />
                          {/* Badge số thứ tự */}
                          <div className="absolute top-3 left-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full font-medium">
                            {index + 1}/{selectedPost.images?.length || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}

          <DialogFooter className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsDetailModalOpen(false)}
              className="min-w-[120px]"
            >
              Đóng
            </Button>
            
            {selectedPost && (
              <>
                {(selectedPost.status === 'PENDING_APPROVAL' || 
                  selectedPost.status === 'DRAFT' ||
                  selectedPost.status === 'REJECTED' ||
                  selectedPost.status === 'INACTIVE') && (
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white min-w-[180px]"
                    onClick={() => handleApproveListing(selectedPost.id || selectedPost.listingId!, true)}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Duyệt bài đăng
                  </Button>
                )}
                
                {(selectedPost.status === 'PENDING_APPROVAL' || 
                  selectedPost.status === 'DRAFT' ||
                  selectedPost.status === 'ACTIVE' ||
                  selectedPost.status === 'APPROVED') && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50 min-w-[180px]"
                    onClick={() => handleRejectListing(selectedPost.id || selectedPost.listingId!, true)}
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Từ chối / Gỡ bài
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default PostManagement;