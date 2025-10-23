import type { User } from '@/types';

/**
 * Kiểm tra xem user có phải là admin không
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;

  return (
    // Kiểm tra roleId = '2' (admin)
    user.roleId === '2' ||
    
    // Kiểm tra role = 'admin'
    user.role === 'admin' ||
    
    // Kiểm tra email admin (fallback)
    user.email === 'admin@evmarket.com'
  );
};
