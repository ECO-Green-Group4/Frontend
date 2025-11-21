import api from './axios';

export interface Post {
id?: number;
listingId?: number; // Có thể API trả về listingId thay vì id
title: string;
content: string;
description?: string;
price: number;
status: 'DRAFT' | 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
category: 'EV' | 'BATTERY' ;
images?: string[];
userId?: number;
user?: {
  userId?: number;
  id?: number;
  fullName: string;
  email: string;
  username?: string;
  phone?: string | null;
  status?: string;
  dateOfBirth?: string;
  gender?: string;
  identityCard?: string | null;
  address?: string | null;
  createdAt?: string | null;
  availableCoupons?: number | null;
};
createdAt?: string; 
updatedAt?: string;
// Thông tin chi tiết từ API
itemType?: 'vehicle' | 'battery';
location?: string;
postType?: string | null;
listingPackageId?: number | null;
packageAmount?: number | null;
packageStatus?: string | null;
packageExpiredAt?: string | null;
// Vehicle fields
brand?: string | null;
model?: string | null;
year?: number | null;
mileage?: number | null;
condition?: string | null;
bodyType?: string | null;
color?: string | null;
inspection?: string | null;
origin?: string | null;
numberOfSeats?: number | null;
licensePlate?: string | null;
accessories?: string | null;
// Battery fields
batteryCapacity?: number | null;
batteryBrand?: string | null;
voltage?: number | null;
type?: string | null;
capacity?: string | null;
healthPercent?: number | null;
manufactureYear?: number | null;
chargeCycles?: number | null;
}

export interface PostResponse {
message: string;
success: boolean;
data: Post[];
}

export interface CreatePostRequest {
title: string;
content: string;
description?: string;
price: number;
category: 'EV' | 'BATTERY' | 'ACCESSORY';
images?: string[];
}

export interface CreatePostResponse {
message: string;
success: boolean;
data: Post;
}

export interface UpdatePostResponse {
message: string;
success: boolean;
data: Post; // API trả về object Post, không phải string
}

export interface DeletePostResponse {
message: string;
success: boolean;
data: string;
}

// Định nghĩa kiểu status
export type PostStatus = 'DRAFT' | 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';

// === TOÀN BỘ SERVICE OBJECT ĐÃ ĐƯỢC SỬA LẠI ĐÚNG ===
export const PostService = {
// Lấy tất cả listings
getAllPosts: async (): Promise<Post[]> => {
try {
console.log('📋 Fetching all listings...');
const response = await api.get<PostResponse>('/admin/listings');
console.log('✅ Listings response:', response.data);
console.log('📊 Total listings:', response.data.data?.length);
if (response.data.data?.length > 0) {
  console.log('🔍 First listing sample:', response.data.data[0]);
}
return response.data.data;
} catch (error: any) {
console.error('❌ Error fetching listings:', error);
console.error('Error response:', error.response?.data);
console.error('Error status:', error.response?.status);
 throw error;
}
},

// Lấy listing theo ID
getPostById: async (postId: number): Promise<Post> => {
try {
console.log('🔍 Fetching listing with ID:', postId);
console.log('📡 Request URL:', `/admin/listings/${postId}`);
const response = await api.get<{ message: string; success: boolean; data: Post }>(`/admin/listings/${postId}`);
console.log('✅ Listing response:', response.data);
return response.data.data;
 } catch (error: any) {
console.error('❌ Error fetching listing:', error);
console.error('Error response:', error.response?.data);
console.error('Error status:', error.response?.status);
console.error('Error message:', error.message);
throw error;
 }
},

// Cập nhật trạng thái (Sửa lỗi 400 - Sử dụng query parameter approved)
updatePostStatus: async (postId: number, newStatus: PostStatus): Promise<UpdatePostResponse> => {
  try {
    console.log('🔄 Updating listing status with ID:', postId, 'New Status:', newStatus);
    
    // Chuyển đổi status thành boolean approved
    const approved = newStatus === 'APPROVED' || newStatus === 'ACTIVE';
    
    console.log('📡 Request URL:', `/admin/listings/${postId}/status?approved=${approved}`);

    const response = await api.put<UpdatePostResponse>(
      `/admin/listings/${postId}/status?approved=${approved}`
    );

    console.log('✅ Update status response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating listing status:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    throw error;
  }
},

// Xóa listing
deletePost: async (postId: number): Promise<DeletePostResponse> => {
  try {
    console.log('Deleting listing with ID:', postId);
    const response = await api.delete<DeletePostResponse>(`/admin/listings/${postId}`);
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
}
};