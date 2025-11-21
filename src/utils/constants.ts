// Constants và config cho app
import type { ApiEndpoints, ValidationRule } from '@/types';

export const API_ENDPOINTS: ApiEndpoints = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me'
  },
  USERS: {
    LIST: '/users',
    PROFILE: '/users/profile',
    UPDATE: '/users/update'
  }
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ADMIN: '/admin'
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Đăng nhập thành công!',
    LOGOUT: 'Đăng xuất thành công!',
    REGISTER: 'Đăng ký thành công!',
    UPDATE_PROFILE: 'Cập nhật thông tin thành công!',
    SAVE: 'Lưu thành công!'
  },
  ERROR: {
    LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
    REGISTER_FAILED: 'Đăng ký thất bại. Vui lòng thử lại.',
    NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng thử lại.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập.',
    NOT_FOUND: 'Không tìm thấy dữ liệu.',
    VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
    GENERIC_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại.'
  }
} as const;

export const VALIDATION_RULES: Record<string, Record<string, ValidationRule>> = {
  EMAIL: {
    REQUIRED: { type: 'required', message: 'Email là bắt buộc' },
    FORMAT: { type: 'email', message: 'Email phải có đuôi @gmail.com' }
  },
  PASSWORD: {
    REQUIRED: { type: 'required', message: 'Mật khẩu là bắt buộc' },
    MIN_LENGTH: { type: 'minLength', value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
    FORMAT: { type: 'password', message: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt' }
  },
  PHONE: {
    REQUIRED: { type: 'required', message: 'Số điện thoại là bắt buộc' },
    FORMAT: { type: 'phone', message: 'Số điện thoại phải bắt đầu bằng 09 và có 10 số' }
  }
} as const;
