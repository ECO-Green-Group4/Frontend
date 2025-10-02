// Custom hook cho theme
import { useTheme as useThemeContext } from '@/context/ThemeContext';
import type { ThemeContextType } from '@/types';

export const useTheme = (): ThemeContextType => {
  return useThemeContext();
};
