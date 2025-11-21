// Main type definitions for the ECO App

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: 'user' | 'admin' | 'staff';
  roleId?: string;
  roleName?: 'user' | 'admin' | 'staff';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileCompleteData {
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  identityCard: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  googleLogin: (idToken: string) => Promise<AuthResponse>;
  googleRegister: (idToken: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<User>;
  updateProfileComplete: (profileData: UpdateProfileCompleteData) => Promise<string>;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// API Response interface cho login
export interface LoginApiResponse {
  message: string;
  role: string;
  token: string;
  id: number;
  sex: string;
  fullName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  dateOfBirth: string;
  sex: string;
  identityCard: string;
  email: string;
  address: string;
  phoneNumber: string;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isDark: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'password' | 'phone' | 'minLength' | 'maxLength';
  value?: number;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface NavbarProps {
  // Navbar specific props if needed
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// API Endpoints types
export interface ApiEndpoints {
  AUTH: {
    LOGIN: string;
    REGISTER: string;
    LOGOUT: string;
    REFRESH: string;
    ME: string;
  };
  USERS: {
    LIST: string;
    PROFILE: string;
    UPDATE: string;
  };
}

// Form types
export interface FormData {
  [key: string]: string | number | boolean;
}

export interface FormErrors {
  [key: string]: string;
}

// Activity types for ECO app
export interface EcoActivity {
  id: string;
  type: 'recycle' | 'water_save' | 'energy_save' | 'transport';
  description: string;
  impact: number;
  unit: string;
  date: string;
  userId: string;
}

export interface EcoStats {
  totalCO2Saved: number;
  totalWaterSaved: number;
  totalActivities: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}
