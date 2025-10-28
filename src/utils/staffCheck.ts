import type { User } from '@/types';

/**
 * Kiểm tra xem user có phải là staff không
 */
export const isStaff = (user: User | null): boolean => {
  if (!user) return false;

  // Normalize values để xử lý cả uppercase/lowercase
  const roleId = String(user.roleId || '').toLowerCase();
  const role = String(user.role || '').toLowerCase();
  const roleName = String(user.roleName || '').toLowerCase();

  return (
    // Kiểm tra roleId = '3' (staff)
    roleId === '3' ||
    
    // Kiểm tra role = 'staff' hoặc 'STAFF'
    role === 'staff' ||
    
    // Kiểm tra roleName = 'staff' hoặc 'STAFF'
    roleName === 'staff'
  );
};

