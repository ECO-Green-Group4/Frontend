// Utility functions cho validation
import type { ValidationRule, ValidationResult, FormData } from '@/types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Ít nhất 8 ký tự, có chữ hoa, chữ thường và số
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone: string): boolean => {
  // Số điện thoại Việt Nam (10-11 số)
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return !value || value.length <= maxLength;
};

export const validateForm = (
  formData: Record<string, any>, 
  rules: Record<string, ValidationRule[]>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];

    fieldRules.forEach(rule => {
      if (rule.type === 'required' && !validateRequired(value)) {
        errors[field] = rule.message || `${field} là bắt buộc`;
      } else if (rule.type === 'email' && value && !validateEmail(value as string)) {
        errors[field] = rule.message || 'Email không hợp lệ';
      } else if (rule.type === 'password' && value && !validatePassword(value as string)) {
        errors[field] = rule.message || 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
      } else if (rule.type === 'phone' && value && !validatePhone(value as string)) {
        errors[field] = rule.message || 'Số điện thoại không hợp lệ';
      } else if (rule.type === 'minLength' && value && rule.value && !validateMinLength(value as string, rule.value)) {
        errors[field] = rule.message || `${field} phải có ít nhất ${rule.value} ký tự`;
      } else if (rule.type === 'maxLength' && value && rule.value && !validateMaxLength(value as string, rule.value)) {
        errors[field] = rule.message || `${field} không được vượt quá ${rule.value} ký tự`;
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
