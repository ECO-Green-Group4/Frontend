import type { User } from '@/types';

/**
 * Kiểm tra xem user có phải là admin không
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;

  return (
    // Kiểm tra email admin
    user.email === 'admin@evmarket.com' ||
    
    // Kiểm tra username admin
    (user as any).username === 'admin' ||
    
    // Kiểm tra fullName chứa "administrator"
    (user as any).fullName?.toLowerCase().includes('administrator') ||
    
    // Kiểm tra role admin
    user.role === 'admin' ||
    (user as any).userRole === 'admin' ||
    (user as any).user_type === 'admin'
  );
};
