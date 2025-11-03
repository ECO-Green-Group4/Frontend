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
userId: number;
user?: {
id: number;
fullName: string;
email: string;
phone: string;
};
createdAt?: string; updatedAt?: string;
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
data: string;
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
console.log('Fetching all listings...');
const response = await api.get<PostResponse>('/admin/listings');
console.log('Listings response:', response.data);
console.log('First listing ID:', response.data.data[0]?.id);
return response.data.data;
} catch (error) {
console.error('Error fetching listings:', error);
 throw error;
}
},

// Lấy listing theo ID
getPostById: async (postId: number): Promise<Post> => {
try {
console.log('Fetching listing with ID:', postId);
const response = await api.get<{ message: string; success: boolean; data: Post }>(`/admin/listings/${postId}`);
console.log('Listing response:', response.data);
return response.data.data;
 } catch (error) {
console.error('Error fetching listing:', error);
throw error;
 }
},

// Cập nhật trạng thái (Sửa lỗi 400 - Sử dụng query parameter approved)
updatePostStatus: async (postId: number, newStatus: PostStatus): Promise<UpdatePostResponse> => {
  try {
    console.log('Updating listing status with ID:', postId, 'New Status:', newStatus);
    
    // Chuyển đổi status thành boolean approved
    const approved = newStatus === 'APPROVED' || newStatus === 'ACTIVE';

    const response = await api.put<UpdatePostResponse>(
      `/admin/listings/${postId}/status?approved=${approved}`
    );

    console.log('Update status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating listing status:', error);
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