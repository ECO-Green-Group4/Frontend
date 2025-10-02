// Custom hook cho authentication
import { useAuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/types';

export const useAuth = (): AuthContextType => {
  return useAuthContext();
};
